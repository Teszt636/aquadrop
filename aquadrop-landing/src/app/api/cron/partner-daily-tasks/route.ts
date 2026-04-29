import { NextResponse } from 'next/server';

import { isCronRequestAuthorized, runPartnerDailyTasksCron } from '@/lib/cron/partner-crm';

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized', wouldSendTo: [], sentEmails: 0, skippedReasons: { unauthorized: 1 }, resendAttempted: false }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const dryRunParam = params.get('dryRun') === '1';
  const debug = params.get('debug') === '1';
  const send = params.get('send') === '1' || params.get('send') === 'true';
  const dryRun = dryRunParam || debug || !send;

  try {
    const result = await runPartnerDailyTasksCron({ dryRun, debug });

    return NextResponse.json({ ...result, debug, requestedSend: send, effectiveDryRun: dryRun });
  } catch (error) {
    console.error('[cron][partner-daily-tasks] Route failed', {
      route: '/api/cron/partner-daily-tasks',
      error: error instanceof Error ? error.message : error
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Cron route failed',
        details: error instanceof Error ? error.message : error,
        dryRun,
        debug,
        requestedSend: send,
        effectiveDryRun: dryRun,
        checkedUsers: 0,
        checkedLeads: 0,
        eligibleLeads: 0,
        wouldSendTo: [],
        sentEmails: 0,
        resendErrors: [error instanceof Error ? error.message : 'Unexpected cron failure'],
        skippedReasons: {},
        resendAttempted: false
      },
      { status: 500 }
    );
  }
}
