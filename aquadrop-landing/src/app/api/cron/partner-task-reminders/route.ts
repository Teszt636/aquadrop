import { NextResponse } from 'next/server';

import {
  isCronRequestAuthorized,
  isCronSecretAuthorized,
  isVercelCronRequest,
  runPartnerTaskReminderCron
} from '@/lib/cron/partner-crm';

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    const nowUtc = new Date().toISOString();
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        dryRun: true,
        debug: false,
        force: false,
        requestedSend: false,
        effectiveDryRun: true,
        nowUtc,
        nowBudapest: '',
        checkedUsers: 0,
        checkedLeads: 0,
        eligibleLeads: 0,
        skippedByTimeWindow: false,
        wouldSendTo: [],
        sentEmails: 0,
        skippedReasons: { unauthorized: 1 },
        resendAttempted: false,
        resendResponses: [],
        resendErrors: []
      },
      { status: 401 }
    );
  }

  const params = new URL(request.url).searchParams;
  const dryRunParam = params.get('dryRun') === '1';
  const debug = params.get('debug') === '1';
  const send = params.get('send') === '1' || params.get('send') === 'true';
  const force = params.get('force') === '1' && isCronSecretAuthorized(request);
  const requestedSend = send || isVercelCronRequest(request);
  const dryRun = dryRunParam || debug || !requestedSend;

  try {
    const result = await runPartnerTaskReminderCron({ dryRun, debug, force });

    return NextResponse.json({ ...result, debug, force, requestedSend, effectiveDryRun: dryRun });
  } catch (error) {
    console.error('[cron][partner-task-reminders] Route failed', {
      route: '/api/cron/partner-task-reminders',
      error: error instanceof Error ? error.message : error
    });
    const nowUtc = new Date().toISOString();

    return NextResponse.json(
      {
        success: false,
        error: 'Cron route failed',
        details: error instanceof Error ? error.message : error,
        dryRun,
        debug,
        force,
        requestedSend,
        effectiveDryRun: dryRun,
        nowUtc,
        nowBudapest: '',
        checkedUsers: 0,
        checkedLeads: 0,
        eligibleLeads: 0,
        skippedByTimeWindow: false,
        wouldSendTo: [],
        sentEmails: 0,
        resendResponses: [],
        resendErrors: [error instanceof Error ? error.message : 'Unexpected cron failure'],
        skippedReasons: {},
        resendAttempted: false
      },
      { status: 500 }
    );
  }
}
