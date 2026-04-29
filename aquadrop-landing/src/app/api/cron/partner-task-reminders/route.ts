import { NextResponse } from 'next/server';

import { isCronRequestAuthorized, runPartnerTaskReminderCron } from '@/lib/cron/partner-crm';

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = new URL(request.url).searchParams.get('dryRun') === '1';

  try {
    const result = await runPartnerTaskReminderCron({ dryRun });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[cron][partner-task-reminders] Route failed', {
      route: '/api/cron/partner-task-reminders',
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
