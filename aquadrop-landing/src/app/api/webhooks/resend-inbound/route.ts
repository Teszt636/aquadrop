import { NextResponse } from 'next/server';

import { buildUtcIsoFromBudapestParts, getBudapestDateTimeParts } from '@/lib/datetime/budapest';

const TOKEN_PATTERN = /\[#gift:([a-zA-Z0-9\-]+)\]/;

function safeTrim(value: unknown): string { return typeof value === 'string' ? value.trim() : ''; }

function summarizeBody(payload: Record<string, unknown>): string {
  const text = safeTrim(payload.text);
  const html = safeTrim(payload.html);
  const preview = safeTrim(payload.preview);
  const normalized = text || html.replace(/<[^>]*>/g, ' ') || preview;
  return normalized ? normalized.slice(0, 1200) : 'Ügyfél válasza érkezett, de a teljes tartalom külön lekérést igényel.';
}

async function fetchInboundBodyFromResend(emailId: string): Promise<string | null> {
  const apiKey = safeTrim(process.env.RESEND_API_KEY);
  if (!apiKey) return null;
  const response = await fetch(`https://api.resend.com/emails/${encodeURIComponent(emailId)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store'
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { text?: string; html?: string; preview?: string; body?: string };
  const text = safeTrim(payload.text);
  const html = safeTrim(payload.html).replace(/<[^>]*>/g, ' ');
  const preview = safeTrim(payload.preview);
  const body = safeTrim(payload.body);
  const normalized = text || body || html || preview;
  return normalized || null;
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
    action: 'ignored',
    updateAttempted: false,
    updateSuccess: false,
    updateError: null as string | null,
    activityLogInserted: false,
    inboundEmailLogged: false
  };

  if (!authorized(request)) {
    console.log('[gift-inbound-webhook]', { ...debugState, reason: 'unauthorized' });
    return NextResponse.json({ success: false, ...debugState, reason: 'unauthorized' }, { status: 401 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const data = (payload.data as Record<string, unknown>) ?? payload;
  const subject = safeTrim(data.subject);
  debugState.subject = subject;
  const tokenMatch = subject.match(TOKEN_PATTERN);
  const resendEmailId = safeTrim(data.email_id) || safeTrim(data.id) || null;
  const sender = safeTrim(data.from) || 'unknown@unknown';
  const hasAttachments = Array.isArray(data.attachments) && data.attachments.length > 0;
  let bodyPreview = summarizeBody(data);
  const payloadHasBody = Boolean(safeTrim(data.text) || safeTrim(data.html) || safeTrim(data.preview));

  const supabaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')}/rest/v1`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const logInboundEmail = async (reason: 'no_token' | 'no_matching_claim', matched: boolean, claimId: string | null = null) => {
    await fetch(`${supabaseUrl}/gift_inbound_emails`, {
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
    debugState.inboundEmailLogged = true;
  };
  if (!tokenMatch) {
    await logInboundEmail('no_token', false);
    console.log('[gift-inbound-webhook]', { ...debugState, reason: 'no_token' });
    return NextResponse.json({ success: true, ...debugState, reason: 'no_token' });
  }

  const statusToken = tokenMatch[1];
  debugState.extractedStatusToken = statusToken;
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
      console.log('[gift-inbound-webhook]', { ...debugState, reason: 'duplicate_event' });
      return NextResponse.json({ success: true, ...debugState, reason: 'duplicate_event' });
    }
    if (!payloadHasBody) {
      const fetchedBody = await fetchInboundBodyFromResend(resendEmailId);
      if (fetchedBody) bodyPreview = fetchedBody.slice(0, 1200);
    }
  }

  debugState.action = 'reopened_for_review';
  const shortBody = bodyPreview.slice(0, 1000);
  const nextActionDescription = `Ügyfél válaszolt az elutasító emailre.\n\nVálasz tartalma:\n${shortBody}\n\nCsatolmány érkezett: ${hasAttachments ? 'igen' : 'nem'}`;

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
  if (!updateRes.ok) debugState.updateError = await updateRes.text();

  const activityRes = await fetch(`${supabaseUrl}/gift_activity_logs`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify([{ gift_claim_id: claim.id, field_name: 'inbound_reply', change_summary: `Válaszolt: ${sender}; Időpont: ${new Date().toISOString()}; Csatolmány: ${hasAttachments ? 'igen' : 'nem'}; Tartalom: ${shortBody.slice(0, 250)}`, old_value: `${safeTrim(claim.pipeline_status)} | ${safeTrim(claim.receipt_check_status)}`, new_value: `Blokk ellenőrzés alatt | Ellenőrzésre vár | ${shortBody.slice(0, 250)} | Csatolmány: ${hasAttachments ? 'igen' : 'nem'}`, changed_by_name: 'Email válasz', changed_by_email: sender, changed_by_user_id: null }]) });
  debugState.activityLogInserted = activityRes.ok;

  const inboundLogRes = await fetch(`${supabaseUrl}/gift_inbound_emails`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify([{ resend_email_id: resendEmailId, gift_claim_id: claim.id, from_email: sender, subject, body_preview: shortBody, has_attachments: hasAttachments, matched: true }]) });
  debugState.inboundEmailLogged = inboundLogRes.ok;

  console.log('[gift-inbound-webhook]', { ...debugState, reason: null });
  return NextResponse.json({ success: true, ...debugState, reason: null });
}
