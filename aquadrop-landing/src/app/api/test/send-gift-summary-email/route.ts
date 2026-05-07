import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { checkEmailRateLimit, markEmailSent } from '@/lib/cron/email-safety';
import { buildGiftDailySummaryEmail, GIFT_DAILY_SUMMARY_STATUSES, type GiftStatusCounts } from '@/lib/cron/gift-crm';
import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';

function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error,
      details: details ?? null,
      dryRun: true,
      wouldSendTo: [],
      sentEmails: 0,
      skippedReasons: { error: 1 },
      resendAttempted: false,
      resendResponses: [],
      resendErrors: []
    },
    { status }
  );
}

function buildTestCounts(): GiftStatusCounts {
  return {
    [GIFT_DAILY_SUMMARY_STATUSES[0]]: 3,
    [GIFT_DAILY_SUMMARY_STATUSES[1]]: 2,
    [GIFT_DAILY_SUMMARY_STATUSES[2]]: 1,
    [GIFT_DAILY_SUMMARY_STATUSES[3]]: 4
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { userEmail?: string; secret?: string; send?: boolean } | null;
  if (!body?.userEmail) {
    return jsonError(400, 'Missing userEmail', { required: ['userEmail'] });
  }

  const adminSession = await requireAdminSession(['admin']);
  const expectedSecret = process.env.TEST_EMAIL_SECRET?.trim();
  const providedSecret = body.secret?.trim() || request.headers.get('x-test-email-secret')?.trim() || undefined;
  const isSecretAuthorized = Boolean(expectedSecret && providedSecret && providedSecret === expectedSecret);
  if (!adminSession && !isSecretAuthorized) {
    return jsonError(401, 'Unauthorized', { message: 'Admin session vagy érvényes TEST_EMAIL_SECRET szükséges.' });
  }

  const now = Date.now();
  const rateLimit = checkEmailRateLimit(body.userEmail, 'gift_summary_test', now);
  if (rateLimit.blocked) {
    return jsonError(429, 'Duplicate request throttled', { retryAfterMs: rateLimit.retryAfterMs });
  }

  const shouldSend = body.send === true;
  const email = buildGiftDailySummaryEmail(buildTestCounts());

  if (!shouldSend) {
    return NextResponse.json({
      success: true,
      dryRun: true,
      message: 'Safe mode: explicit send=true nélkül nem küld emailt.',
      wouldSendTo: [body.userEmail],
      sentEmails: 0,
      skippedReasons: { safe_mode: 1 },
      resendAttempted: false,
      resendResponses: [],
      resendErrors: [],
      to: body.userEmail
    });
  }

  try {
    const resend = await sendEmailWithResend({
      from: resolveAquadropSenderEmail({ allowFallback: true }),
      to: body.userEmail,
      subject: email.subject,
      html: email.html,
      replyTo: ['hello@aquadrop.hu']
    });
    markEmailSent(body.userEmail, 'gift_summary_test', now);

    return NextResponse.json({
      success: true,
      dryRun: false,
      wouldSendTo: [body.userEmail],
      sentEmails: 1,
      skippedReasons: {},
      resendAttempted: true,
      resendResponses: [{ userEmail: body.userEmail, resendId: resend?.id ?? null }],
      resendErrors: [],
      to: body.userEmail
    });
  } catch (error) {
    return jsonError(500, 'Failed to send gift summary test email', error instanceof Error ? error.message : error);
  }
}
