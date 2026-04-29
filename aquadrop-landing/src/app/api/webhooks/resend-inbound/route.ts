import { NextResponse } from 'next/server';

import { buildUtcIsoFromBudapestParts, getBudapestDateTimeParts } from '@/lib/datetime/budapest';

const TOKEN_PATTERN = /\[#gift:([a-zA-Z0-9-]+)\]/i;

function safeTrim(value: unknown): string { return typeof value === 'string' ? value.trim() : ''; }

function stripHtml(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');
}

function sanitizeInboundText(input: string): string {
  const normalizedWhitespace = input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\t\f\v]+/g, ' ')
    .replace(/\u00a0/g, ' ');

  const cutPatterns = [/\nOn\s[\s\S]+?wrote:\s*$/im, /\n-{2,}\s*Original Message\s*-{2,}[\s\S]*$/im, /\nFrom:\s[\s\S]+?\nSent:\s[\s\S]+?\nTo:\s[\s\S]+?\nSubject:\s[\s\S]*$/im];

  let cleaned = normalizedWhitespace;
  for (const pattern of cutPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  return cleaned
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

function shortenText(input: string, maxLength = 300): string {
  if (input.length <= maxLength) return input;
  return `${input.slice(0, maxLength).trimEnd()}...`;
}

type BodySource = 'payload.text' | 'payload.html' | 'receiving.text' | 'receiving.html' | 'none';

function extractBodyFromPayload(payload: Record<string, unknown>): { body: string; source: BodySource } {
  const text = safeTrim(payload.text);
  if (text) return { body: sanitizeInboundText(text), source: 'payload.text' };
  const html = safeTrim(payload.html);
  if (html) return { body: sanitizeInboundText(stripHtml(html)), source: 'payload.html' };
  return { body: '', source: 'none' };
}

async function fetchInboundBodyFromResend(emailId: string): Promise<{ body: string | null; source: BodySource; success: boolean }> {
  const apiKey = safeTrim(process.env.RESEND_API_KEY);
  if (!apiKey) return { body: null, source: 'none', success: false };

  // NOTE: resend SDK is currently not installed in this project, therefore we call the Receiving API directly.
  const response = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(emailId)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store'
  });
  if (!response.ok) return { body: null, source: 'none', success: false };
  const payload = (await response.json()) as { text?: string; html?: string; preview?: string; body?: string };
  const text = safeTrim(payload.text);
  if (text) return { body: sanitizeInboundText(text), source: 'receiving.text', success: true };

  const html = safeTrim(payload.html);
  if (html) return { body: sanitizeInboundText(stripHtml(html)), source: 'receiving.html', success: true };

  return { body: null, source: 'none', success: true };
}

function computeNextActionAt(now = new Date()): string {
  const nowParts = getBudapestDateTimeParts(now.toISOString());
  const hour = Number(nowParts.hour);
  const minute = Number(nowParts.minute);
  const nowDay = new Date(`${nowParts.date}T00:00:00.000Z`);
  const isWorkday = ![0, 6].includes(nowDay.getUTCDay());
  const isBusinessTime = isWorkday && (hour > 10 || (hour === 10 && minute >= 0)) && hour < 20;
  if (!isBusinessTime) {
    const day = new Date(`${nowParts.date}T00:00:00.000Z`);
    day.setUTCDate(day.getUTCDate() + 1);
    while ([0, 6].includes(day.getUTCDay())) day.setUTCDate(day.getUTCDate() + 1);
    return buildUtcIsoFromBudapestParts(day.toISOString().slice(0, 10), 10, 0);
  }

  const target = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const targetParts = getBudapestDateTimeParts(target.toISOString());
  if (Number(targetParts.hour) >= 20) {
    const day = new Date(`${targetParts.date}T00:00:00.000Z`);
    day.setUTCDate(day.getUTCDate() + 1);
    while ([0, 6].includes(day.getUTCDay())) day.setUTCDate(day.getUTCDate() + 1);
    return buildUtcIsoFromBudapestParts(day.toISOString().slice(0, 10), 10, 0);
  }
  return target.toISOString();
}

function authorized(request: Request): boolean {
  const fallback = process.env.INBOUND_WEBHOOK_SECRET;
  if (!fallback) return false;
  const header = request.headers.get('x-inbound-webhook-secret');
  const query = new URL(request.url).searchParams.get('secret');
  return header === fallback || query === fallback;
}

export async function POST(request: Request) {
  const debugState = {
    webhookReceived: true,
    subject: '',
    extractedStatusToken: null as string | null,
    matchedGiftClaimId: null as string | null,
    updateAttempted: false,
    updateSuccess: false,
    updateError: null as string | null,
    reason: null as string | null,
    emailId: null as string | null,
    receivingFetchAttempted: false,
    receivingFetchSuccess: false,
    bodySource: 'none' as BodySource,
    bodyPreviewLength: 0
  };

  if (!authorized(request)) {
    console.log('[gift-inbound-webhook]', { ...debugState, reason: 'unauthorized' });
    return NextResponse.json({ success: false, ...debugState, reason: 'unauthorized' }, { status: 401 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const data = (payload.data as Record<string, unknown>) ?? payload;
  const subject = safeTrim(data.subject);
  debugState.subject = subject;
  const resendEmailId = safeTrim(data.email_id) || null;
  debugState.emailId = resendEmailId;
  const sender = safeTrim(data.from) || 'unknown@unknown';
  const hasAttachments = Array.isArray(data.attachments) && data.attachments.length > 0;
  const payloadBody = extractBodyFromPayload(data);
  let bodyPreview = payloadBody.body;
  debugState.bodySource = payloadBody.source;
  const payloadHasBody = Boolean(bodyPreview);
  const subjectTokenMatch = subject.match(TOKEN_PATTERN);
  let statusToken = subjectTokenMatch?.[1] ?? null;

  const supabaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')}/rest/v1`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const logInboundEmail = async (reason: string, matched: boolean, claimId: string | null = null) => {
    const response = await fetch(`${supabaseUrl}/gift_inbound_emails`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify([{
        resend_email_id: resendEmailId,
        gift_claim_id: claimId,
        from_email: sender,
        subject,
        body_preview: bodyPreview.slice(0, 1000),
        has_attachments: hasAttachments,
        reason,
        matched
      }])
    });
    if (!response.ok) {
      console.error('[gift-inbound-webhook] failed to log inbound email', {
        reason,
        status: response.status,
        statusText: response.statusText,
        body: await response.text()
      });
    }
  };
  if (!statusToken && !payloadHasBody && resendEmailId) {
    debugState.receivingFetchAttempted = true;
    const fetchedBodyForToken = await fetchInboundBodyFromResend(resendEmailId);
    debugState.receivingFetchSuccess = fetchedBodyForToken.success;
    if (fetchedBodyForToken.body) {
      bodyPreview = fetchedBodyForToken.body;
      debugState.bodySource = fetchedBodyForToken.source;
    }
  }
  if (!statusToken) {
    const bodyTokenMatch = bodyPreview.match(TOKEN_PATTERN);
    statusToken = bodyTokenMatch?.[1] ?? null;
  }
  debugState.extractedStatusToken = statusToken;

  if (!statusToken) {
    await logInboundEmail('no_token', false);
    console.log('[gift-inbound-webhook]', { ...debugState, reason: 'no_token' });
    return NextResponse.json({ success: true, ...debugState, reason: 'no_token' });
  }
  const claimRes = await fetch(`${supabaseUrl}/gift_claims?select=id,pipeline_status,receipt_check_status,assigned_to&status_token=eq.${statusToken}&limit=1`, { headers, cache: 'no-store' });
  const claims = (await claimRes.json()) as Array<{id:string;pipeline_status:string|null;receipt_check_status:string|null;assigned_to:string|null}>;
  const claim = claims[0];
  if (!claim) {
    await logInboundEmail('no_matching_claim', false);
    console.log('[gift-inbound-webhook]', { ...debugState, reason: 'no_matching_claim' });
    return NextResponse.json({ success: true, ...debugState, reason: 'no_matching_claim' });
  }
  debugState.matchedGiftClaimId = claim.id;

  if (resendEmailId) {
    const dedupe = await fetch(`${supabaseUrl}/gift_inbound_emails?select=id&resend_email_id=eq.${encodeURIComponent(resendEmailId)}&limit=1`, { headers, cache: 'no-store' });
    const dedupeRows = (await dedupe.json()) as Array<{ id: string }>;
    if (dedupeRows.length > 0) {
      await logInboundEmail('duplicate_event', true, claim.id);
      console.log('[gift-inbound-webhook]', { ...debugState, reason: 'duplicate_event' });
      return NextResponse.json({ success: true, ...debugState, reason: 'duplicate_event' });
    }
    if (!payloadHasBody) {
      debugState.receivingFetchAttempted = true;
      const fetchedBody = await fetchInboundBodyFromResend(resendEmailId);
      debugState.receivingFetchSuccess = fetchedBody.success;
      if (fetchedBody.body) {
        bodyPreview = fetchedBody.body;
        debugState.bodySource = fetchedBody.source;
      }
    }
  }

  const shortBody = bodyPreview ? shortenText(bodyPreview, 300) : '';
  debugState.bodyPreviewLength = shortBody.length;
  const replyContent = shortBody || 'Ügyfél válasza érkezett, de a tartalom nem volt elérhető.';
  const nextActionDescription = `Ügyfél válaszolt az emailre.\n\nVálasz tartalma:\n${replyContent}\n\nCsatolmány érkezett: ${hasAttachments ? 'igen' : 'nem'}`;

  const adminRes = await fetch(`${supabaseUrl}/admin_users?select=id&name=eq.Bartók Csaba&is_active=eq.true&limit=1`, { headers, cache: 'no-store' });
  const adminRows = (await adminRes.json()) as Array<{ id: string }>;

  debugState.updateAttempted = true;
  const updateRes = await fetch(`${supabaseUrl}/gift_claims?id=eq.${claim.id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({
        pipeline_status: 'Blokk ellenőrzés alatt',
        receipt_check_status: 'Ellenőrzésre vár',
        next_action_description: nextActionDescription,
        assigned_to: claim.assigned_to ?? adminRows[0]?.id ?? null,
        next_action_at: computeNextActionAt()
      })
    });
  debugState.updateSuccess = updateRes.ok;
  if (!updateRes.ok) {
    const updateErrorText = await updateRes.text();
    debugState.updateError = updateErrorText;
    console.error('[gift-inbound-webhook] Failed to update gift claim', {
      giftClaimId: claim.id,
      status: updateRes.status,
      statusText: updateRes.statusText,
      updateError: updateErrorText
    });
  }

  const activityRes = await fetch(`${supabaseUrl}/gift_activity_logs`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify([{ gift_claim_id: claim.id, field_name: 'inbound_reply', change_summary: 'Ügyfél válaszolt emailben, az ügy újranyitva ellenőrzésre.', old_value: `${safeTrim(claim.pipeline_status)} | ${safeTrim(claim.receipt_check_status)}`, new_value: `Blokk ellenőrzés alatt | Ellenőrzésre vár | ${replyContent} | Csatolmány: ${hasAttachments ? 'igen' : 'nem'}`, changed_by_name: 'Email válasz', changed_by_email: sender, changed_by_user_id: null }]) });

  const inboundReason = updateRes.ok ? (activityRes.ok ? 'matched_updated' : 'activity_log_failed') : `update_failed: ${debugState.updateError ?? 'unknown_error'}`;
  await logInboundEmail(inboundReason, true, claim.id);

  const reason = updateRes.ok ? null : inboundReason;
  console.log('[gift-inbound-webhook]', { ...debugState, reason });
  return NextResponse.json({ success: true, ...debugState, reason });
}
