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

function computeNextActionAt(now = new Date()): string {
  const target = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const targetParts = getBudapestDateTimeParts(target.toISOString());
  if (Number(targetParts.hour) >= 20) {
    const today = getBudapestDateTimeParts(now.toISOString()).date;
    const day = new Date(`${today}T00:00:00.000Z`);
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
  if (!authorized(request)) {
    return NextResponse.json({ success: false, matched: false, action: 'ignored', reason: 'unauthorized' }, { status: 401 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const data = (payload.data as Record<string, unknown>) ?? payload;
  const subject = safeTrim(data.subject);
  const tokenMatch = subject.match(TOKEN_PATTERN);
  if (!tokenMatch) return NextResponse.json({ success: true, matched: false, giftClaimId: null, action: 'ignored', reason: 'token_not_found' });

  const statusToken = tokenMatch[1];
  const supabaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')}/rest/v1`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  const claimRes = await fetch(`${supabaseUrl}/gift_claims?select=id,pipeline_status,receipt_check_status,assigned_to&status_token=eq.${statusToken}&limit=1`, { headers, cache: 'no-store' });
  const claims = (await claimRes.json()) as Array<{id:string;pipeline_status:string|null;receipt_check_status:string|null;assigned_to:string|null}>;
  const claim = claims[0];
  if (!claim) return NextResponse.json({ success: true, matched: false, giftClaimId: null, action: 'ignored', reason: 'gift_claim_not_found' });

  const resendEmailId = safeTrim(data.email_id) || safeTrim(data.id) || null;
  if (resendEmailId) {
    const dedupe = await fetch(`${supabaseUrl}/gift_inbound_emails?select=id&resend_email_id=eq.${encodeURIComponent(resendEmailId)}&limit=1`, { headers, cache: 'no-store' });
    const dedupeRows = (await dedupe.json()) as Array<{ id: string }>;
    if (dedupeRows.length > 0) return NextResponse.json({ success: true, matched: true, giftClaimId: claim.id, action: 'ignored', reason: 'duplicate_event' });
  }

  const sender = safeTrim(data.from) || 'unknown@unknown';
  const hasAttachments = Array.isArray(data.attachments) && data.attachments.length > 0;
  const bodyPreview = summarizeBody(data);
  const nextActionDescription = `Ügyfél válaszolt az emailre.\n\nVálasz tartalma:\n${bodyPreview}\n\nCsatolmány érkezett: ${hasAttachments ? 'igen' : 'nem'}`;

  const adminRes = await fetch(`${supabaseUrl}/admin_users?select=id&name=eq.Bartók Csaba&is_active=eq.true&limit=1`, { headers, cache: 'no-store' });
  const adminRows = (await adminRes.json()) as Array<{ id: string }>;

  await fetch(`${supabaseUrl}/gift_claims?id=eq.${claim.id}`, {
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

  await fetch(`${supabaseUrl}/gift_activity_logs`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify([{ gift_claim_id: claim.id, field_name: 'inbound_reply', change_summary: 'Ügyfél válaszolt emailben, az ügy újranyitva ellenőrzésre.', old_value: `${safeTrim(claim.pipeline_status)} | ${safeTrim(claim.receipt_check_status)}`, new_value: `Blokk ellenőrzés alatt | Ellenőrzésre vár | ${bodyPreview.slice(0, 250)}`, changed_by_name: 'Email válasz', changed_by_email: sender, changed_by_user_id: null }]) });

  await fetch(`${supabaseUrl}/gift_inbound_emails`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify([{ resend_email_id: resendEmailId, gift_claim_id: claim.id, from_email: sender, subject, body_preview: bodyPreview.slice(0, 1000), has_attachments: hasAttachments }]) });

  return NextResponse.json({ success: true, matched: true, giftClaimId: claim.id, action: 'reopened_for_review', reason: null });
}
