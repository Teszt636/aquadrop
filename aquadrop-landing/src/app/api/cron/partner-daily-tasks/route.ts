import { NextResponse } from 'next/server';

import { isCronRequestAuthorized, runPartnerDailyTasksCron } from '@/lib/cron/partner-crm';

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const dryRun = params.get('dryRun') === '1';
  const debug = params.get('debug') === '1';

  try {
    const result = await runPartnerDailyTasksCron({ dryRun, debug });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[cron][partner-daily-tasks] Route failed', {
      route: '/api/cron/partner-daily-tasks',
      error: error instanceof Error ? error.message : error
    });

    return NextResponse.json(
      {
        success: false,
        dryRun,
        checkedUsers: 0,
        checkedLeads: 0,
        eligibleLeads: 0,
        wouldSendTo: [],
        sentEmails: 0,
        resendErrors: [error instanceof Error ? error.message : 'Unexpected cron failure'],
        skippedReasons: {}
      },
      { status: 500 }
    );
  }
}
