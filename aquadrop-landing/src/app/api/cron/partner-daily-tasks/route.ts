import { NextResponse } from 'next/server';

import { isCronRequestAuthorized, runPartnerDailyTasksCron } from '@/lib/cron/partner-crm';

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = new URL(request.url).searchParams.get('dryRun') === '1';

  try {
    const result = await runPartnerDailyTasksCron({ dryRun });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[cron][partner-daily-tasks] Route failed', {
      route: '/api/cron/partner-daily-tasks',
      error: error instanceof Error ? error.message : error
    });

    return NextResponse.json(
      {
        success: false,
        checkedUsers: 0,
        sentEmails: 0,
        skippedEmails: 0,
        errors: [error instanceof Error ? error.message : 'Unexpected cron failure']
      },
      { status: 500 }
    );
  }
}
