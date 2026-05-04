import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import { renderBrandedEmailLayout } from '@/lib/email/templates';

type EligibleGiftClaim = {
  id: string;
  full_name: string | null;
  email: string | null;
  pipeline_status: string | null;
  delivered_at: string | null;
};

const GOOGLE_REVIEW_URL = 'https://g.page/r/CT2R_at_xJV6EAE/review';
const REPLY_TO_EMAIL = 'hello@aquadrop.hu';

function getRestUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return `${supabaseUrl.replace(/\/$/, '')}/rest/v1`;
}

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return key;
}

function getServiceHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  const serviceRoleKey = getServiceRoleKey();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    ...(additionalHeaders ?? {})
  };
}

function isAuthorizedBySecret(request: Request): boolean {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  return bearerToken === secret;
}

async function authorizeAdmin(request: Request): Promise<boolean> {
  const sessionUser = await requireAdminSession(['admin']);
  if (sessionUser) return true;
  return isAuthorizedBySecret(request);
}

async function fetchEligibleGiftClaims(daysAfterDelivery: number): Promise<EligibleGiftClaim[]> {
  const cutoffDate = new Date(Date.now() - daysAfterDelivery * 24 * 60 * 60 * 1000).toISOString();
  const query = new URLSearchParams({
    select: 'id,full_name,email,pipeline_status,delivered_at',
    pipeline_status: 'in.("Kézbesítve","Lezárva")',
    delivered_at: `lte.${cutoffDate}`,
    review_request_sent_at: 'is.null',
    email: 'not.is.null',
    order: 'delivered_at.asc',
    limit: '500'
  });

  const response = await fetch(`${getRestUrl()}/gift_claims?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch eligible gift claims: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as EligibleGiftClaim[];
  return rows.filter((row) => Boolean(row.email?.trim()));
}

function buildReviewEmail(name: string): { subject: string; html: string } {
  const subject = 'Köszönjük a bizalmad – megírnád a tapasztalatod?';
  const bodyHtml = `
    <p style="margin: 0 0 16px;">Szia ${name}!</p>
    <p style="margin: 0 0 16px;">Reméljük, rendben megérkezett az Aquadrop ajándékcsomagod.</p>
    <p style="margin: 0 0 16px;">Mivel az ajándékigényléshez korábbi Aquadrop Expert Pro vásárlás szükséges, örömmel vennénk, ha pár szóban megírnád a tapasztalatodat a termékről Google értékelésben.</p>
    <p style="margin: 0 0 16px;">Ez nekünk nagyon sokat segít, más vásárlóknak pedig megkönnyíti a döntést.</p>
    <p style="margin: 0 0 16px;">Köszönjük, hogy az Aquadrop Expert Pro-t választottad!</p>
    <p style="margin: 0;">Üdvözlettel:<br/>Aquadrop Ügyfélszolgálat</p>
  `;

  return {
    subject,
    html: renderBrandedEmailLayout({
      subject,
      headline: 'Köszönjük a bizalmad',
      bodyHtml,
      ctaText: 'Google értékelést írok',
      ctaUrl: GOOGLE_REVIEW_URL
    })
  };
}

async function markReviewRequestStatus(id: string, status: 'sent' | 'failed', includeSentAt: boolean): Promise<void> {
  const updates: Record<string, unknown> = {
    review_request_email_status: status
  };

  if (includeSentAt) {
    updates.review_request_sent_at = new Date().toISOString();
  }

  const response = await fetch(`${getRestUrl()}/gift_claims?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getServiceHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error(`Failed to update gift claim ${id}: ${response.status} ${await response.text()}`);
  }
}

async function handleRequest(request: Request) {
  const isAuthorized = await authorizeAdmin(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const dryRunParam = searchParams.get('dryRun');
  const send = searchParams.get('send') === 'true';
  const daysAfterDelivery = Number.parseInt(searchParams.get('daysAfterDelivery') ?? '3', 10);
  const dryRun = dryRunParam === null ? true : dryRunParam === 'true';

  if (!Number.isFinite(daysAfterDelivery) || daysAfterDelivery < 0) {
    return NextResponse.json({ success: false, error: 'daysAfterDelivery must be a non-negative integer.' }, { status: 400 });
  }

  const effectiveDryRun = dryRun || !send;
  const eligibleClaims = await fetchEligibleGiftClaims(daysAfterDelivery);

  if (effectiveDryRun) {
    return NextResponse.json({
      dryRun: true,
      sendRequested: send,
      daysAfterDelivery,
      eligibleCount: eligibleClaims.length,
      items: eligibleClaims.map((item) => ({
        id: item.id,
        full_name: item.full_name,
        email: item.email,
        pipeline_status: item.pipeline_status,
        delivered_at: item.delivered_at
      }))
    });
  }

  const senderEmail = resolveAquadropSenderEmail({ allowFallback: true });
  const results: Array<Record<string, unknown>> = [];
  let sentCount = 0;
  let failedCount = 0;

  for (const claim of eligibleClaims) {
    const recipientEmail = claim.email?.trim();
    if (!recipientEmail) continue;

    try {
      const { subject, html } = buildReviewEmail((claim.full_name ?? '').trim() || 'Vásárlónk');
      await sendEmailWithResend({
        from: senderEmail,
        to: recipientEmail,
        subject,
        html,
        replyTo: REPLY_TO_EMAIL
      });
      await markReviewRequestStatus(claim.id, 'sent', true);
      sentCount += 1;
      results.push({ id: claim.id, email: recipientEmail, status: 'sent' });
    } catch (error) {
      failedCount += 1;
      const reason = error instanceof Error ? error.message : 'Unexpected error';
      console.error('[gift-review-request] send failed', { giftClaimId: claim.id, email: recipientEmail, reason });
      try {
        await markReviewRequestStatus(claim.id, 'failed', false);
      } catch (updateError) {
        console.error('[gift-review-request] failed to update failed status', {
          giftClaimId: claim.id,
          reason: updateError instanceof Error ? updateError.message : 'Unexpected update error'
        });
      }
      results.push({ id: claim.id, email: recipientEmail, status: 'failed', reason });
    }
  }

  return NextResponse.json({
    dryRun: false,
    daysAfterDelivery,
    sentCount,
    failedCount,
    results
  });
}

export async function GET(request: Request) {
  try {
    return await handleRequest(request);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process review requests.', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    return await handleRequest(request);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process review requests.', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
