import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import {
  buildPartnerDailyTasksEmail,
  buildPartnerOneHourReminderEmail,
  type PartnerTaskLeadItem
} from '@/lib/email/templates';
import {
  formatBudapestDateTime,
  getBudapestDateKey,
  getBudapestDayRange,
  getBudapestNow
} from '@/lib/datetime/budapest';
import { checkEmailRateLimit, markEmailSent } from '@/lib/cron/email-safety';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
};

type ResellerLead = {
  id: string;
  assigned_to: string | null;
  next_action_at: string | null;
  next_action_description: string | null;
  pipeline_status: string | null;
  is_hot_lead: boolean | null;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  lead_score: number | null;
};

type NotificationLogRow = {
  notification_type: 'partner_daily_tasks' | 'partner_1h_reminder';
  crm_type: 'partner';
  recipient_user_id: string;
  recipient_email: string;
  reseller_application_id?: string | null;
  notification_date?: string | null;
  next_action_at_snapshot?: string | null;
};

const CLOSED_STATUSES = new Set(['Partner lett', 'Elutasítva']);
const REPLY_TO_EMAIL = 'hello@aquadrop.hu';
const CC_ADMIN_EMAIL = 'admin@aquadrop.hu';

function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return value.replace(/\/$/, '');
}

function getServiceRoleKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return value;
}

function getRestUrl(): string {
  return `${getSupabaseUrl()}/rest/v1`;
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

function toLeadItem(lead: ResellerLead): PartnerTaskLeadItem {
  return {
    companyName: lead.company_name,
    contactName: lead.contact_name,
    nextActionAt: lead.next_action_at,
    nextActionDescription: lead.next_action_description,
    leadScore: lead.lead_score,
    pipelineStatus: lead.pipeline_status
  };
}

async function fetchAdminUsers(params?: { activeOnly?: boolean }): Promise<AdminUser[]> {
  const query = new URLSearchParams({
    select: 'id,name,email,is_active',
    order: 'name.asc',
    limit: '500'
  });
  if (params?.activeOnly) {
    query.set('is_active', 'eq.true');
  }

  const response = await fetch(`${getRestUrl()}/admin_users?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch admin users: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as AdminUser[];
}

async function fetchAssignedOpenLeads(adminUserId: string): Promise<ResellerLead[]> {
  const query = new URLSearchParams({
    select:
      'id,assigned_to,next_action_at,next_action_description,pipeline_status,is_hot_lead,company_name,contact_name,email,phone,lead_score',
    assigned_to: `eq.${adminUserId}`,
    pipeline_status: 'not.in.(Partner lett,Elutasítva)',
    order: 'next_action_at.asc.nullslast',
    limit: '500'
  });

  const response = await fetch(`${getRestUrl()}/reseller_applications?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch assigned reseller leads: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as ResellerLead[];
}

async function fetchLeadsDueWithinOneHour(windowStartIso: string, windowEndIso: string): Promise<ResellerLead[]> {
  const query = new URLSearchParams({
    select:
      'id,assigned_to,next_action_at,next_action_description,pipeline_status,is_hot_lead,company_name,contact_name,email,phone,lead_score',
    assigned_to: 'not.is.null',
    next_action_at: `gte.${windowStartIso}`,
    and: `(next_action_at.lt.${windowEndIso},pipeline_status.not.in.(Partner lett,Elutasítva))`,
    order: 'next_action_at.asc',
    limit: '500'
  });

  const response = await fetch(`${getRestUrl()}/reseller_applications?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reminder leads: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as ResellerLead[];
}

async function hasDailyNotificationForUser(userId: string, date: string): Promise<boolean> {
  const query = new URLSearchParams({
    select: 'id',
    notification_type: 'eq.partner_daily_tasks',
    crm_type: 'eq.partner',
    recipient_user_id: `eq.${userId}`,
    notification_date: `eq.${date}`,
    limit: '1'
  });

  const response = await fetch(`${getRestUrl()}/crm_email_notifications?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to read daily notification logs: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.length > 0;
}

async function hasReminderNotification(leadId: string, nextActionAt: string): Promise<boolean> {
  const query = new URLSearchParams({
    select: 'id',
    notification_type: 'eq.partner_1h_reminder',
    crm_type: 'eq.partner',
    reseller_application_id: `eq.${leadId}`,
    next_action_at_snapshot: `eq.${nextActionAt}`,
    limit: '1'
  });

  const response = await fetch(`${getRestUrl()}/crm_email_notifications?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to read 1h reminder logs: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.length > 0;
}

async function insertNotificationLogs(rows: NotificationLogRow[]): Promise<void> {
  if (rows.length === 0) return;

  const response = await fetch(`${getRestUrl()}/crm_email_notifications`, {
    method: 'POST',
    headers: getServiceHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    throw new Error(`Failed to insert notification logs: ${response.status} ${await response.text()}`);
  }
}

export function isClosedPipelineStatus(status: string | null): boolean {
  if (!status) return false;
  return CLOSED_STATUSES.has(status);
}

export function isCronRequestAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const querySecret = new URL(request.url).searchParams.get('secret');
  const vercelCronHeader = request.headers.get('x-vercel-cron');

  if (secret && (bearerToken === secret || querySecret === secret)) {
    return true;
  }

  return vercelCronHeader === '1';
}

export async function runPartnerDailyTasksCron(params: { dryRun: boolean; debug?: boolean }) {
  const nowSnapshot = getBudapestNow();
  const localDate = nowSnapshot.date;
  const hour = nowSnapshot.hour;
  const todayRangeUtc = getBudapestDayRange(localDate);
  const senderEmail = resolveAquadropSenderEmail({ allowFallback: true });
  const admins = await fetchAdminUsers({ activeOnly: true });
  const summary = {
    success: true,
    todayBudapest: localDate,
    todayRangeUtc,
    checkedUsers: admins.length,
    checkedLeads: 0,
    usersWithTasks: 0,
    overdueCount: 0,
    todayCount: 0,
    hotCount: 0,
    sentEmails: 0,
    skippedEmails: 0,
    resendErrors: [] as string[],
    dryRun: params.dryRun,
    skippedByTimeWindow: false,
    skippedReasons: {} as Record<string, number>,
    wouldSendTo: [] as Array<{ userEmail: string; overdue: number; today: number; hot: number }>,
    resendResponses: [] as Array<{ userEmail: string; resendId: string | null }>,
    resendAttempted: false
  };

  const budapestWeekday = new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Budapest',weekday:'short'}).format(new Date(nowSnapshot.nowUtc));
  const isWeekday = !['Sat','Sun'].includes(budapestWeekday);

  if (!isWeekday) {
    summary.skippedByTimeWindow = true;
    summary.skippedEmails = admins.length;
    summary.skippedReasons.weekend = admins.length;
    return { ...summary, nowUtc: nowSnapshot.nowUtc, nowBudapest: nowSnapshot.nowBudapest };
  }

  if (hour !== 8) {
    summary.skippedByTimeWindow = true;
    summary.skippedEmails = admins.length;
    summary.skippedReasons.outside_daily_window = admins.length;
    return { ...summary, nowUtc: nowSnapshot.nowUtc, nowBudapest: nowSnapshot.nowBudapest };
  }

  for (const admin of admins) {
    try {
      const leads = await fetchAssignedOpenLeads(admin.id);
      summary.checkedLeads += leads.length;
      const overdue = leads.filter((lead) => {
        if (!lead.next_action_at) return false;
        const dueDate = getBudapestDateKey(lead.next_action_at);
        return Boolean(dueDate && dueDate < localDate);
      });
      const today = leads.filter((lead) => {
        if (!lead.next_action_at) return false;
        const dueDate = getBudapestDateKey(lead.next_action_at);
        return dueDate === localDate;
      });
      const hot = leads.filter((lead) => Boolean(lead.is_hot_lead) && !isClosedPipelineStatus(lead.pipeline_status));
      summary.overdueCount += overdue.length;
      summary.todayCount += today.length;
      summary.hotCount += hot.length;

      if (overdue.length === 0 && today.length === 0 && hot.length === 0) {
        summary.skippedEmails += 1;
        summary.skippedReasons.no_tasks = (summary.skippedReasons.no_tasks ?? 0) + 1;
        continue;
      }
      summary.usersWithTasks += 1;

      const alreadySent = await hasDailyNotificationForUser(admin.id, localDate);
      if (alreadySent) {
        summary.skippedEmails += 1;
        summary.skippedReasons.already_sent = (summary.skippedReasons.already_sent ?? 0) + 1;
        continue;
      }

      if (params.dryRun) {
        summary.wouldSendTo.push({
          userEmail: admin.email,
          overdue: overdue.length,
          today: today.length,
          hot: hot.length
        });
        continue;
      }

      const rateLimit = checkEmailRateLimit(admin.email, 'partner_daily_tasks');
      if (rateLimit.blocked) {
        summary.skippedEmails += 1;
        summary.skippedReasons.rate_limited = (summary.skippedReasons.rate_limited ?? 0) + 1;
        continue;
      }

      const email = buildPartnerDailyTasksEmail({
        overdueLeads: overdue.map(toLeadItem),
        todayLeads: today.map(toLeadItem),
        hotLeads: hot.map(toLeadItem)
      });

      summary.resendAttempted = true;
      const resendResponse = await sendEmailWithResend({
        from: senderEmail,
        to: [admin.email, CC_ADMIN_EMAIL],
        subject: email.subject,
        html: email.html,
        replyTo: [REPLY_TO_EMAIL]
      });
      summary.resendResponses.push({
        userEmail: admin.email,
        resendId: typeof resendResponse.id === 'string' ? resendResponse.id : null
      });

      await insertNotificationLogs([
        {
          notification_type: 'partner_daily_tasks',
          crm_type: 'partner',
          recipient_user_id: admin.id,
          recipient_email: admin.email,
          notification_date: localDate
        }
      ]);

      markEmailSent(admin.email, 'partner_daily_tasks');
      summary.sentEmails += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ismeretlen hiba';
      console.error('[cron][partner-daily-tasks] User processing failed', {
        route: '/api/cron/partner-daily-tasks',
        userEmail: admin.email,
        resendError: message,
        supabaseError: message
      });
      summary.resendErrors.push(`${admin.email}: ${message}`);
    }
  }

  return { ...summary, nowUtc: nowSnapshot.nowUtc, nowBudapest: nowSnapshot.nowBudapest };
}

export async function runPartnerTaskReminderCron(params: { dryRun: boolean; debug?: boolean }) {
  const senderEmail = resolveAquadropSenderEmail({ allowFallback: true });
  const now = new Date();
  const windowStartIso = new Date(now.getTime() + 55 * 60 * 1000).toISOString();
  const windowEndIso = new Date(now.getTime() + 65 * 60 * 1000).toISOString();

  const users = await fetchAdminUsers();
  const userById = new Map(users.map((user) => [user.id, user]));
  const activeUsers = users.filter((user) => user.is_active);

  const summary = {
    success: true,
    nowUtc: windowStartIso,
    nowBudapest: formatBudapestDateTime(windowStartIso),
    windowStartUtc: windowStartIso,
    windowEndUtc: windowEndIso,
    checkedUsers: activeUsers.length,
    checkedLeads: 0,
    eligibleLeads: 0,
    sentEmails: 0,
    skippedEmails: 0,
    resendErrors: [] as string[],
    dryRun: params.dryRun,
    skippedReasons: {} as Record<string, number>,
    wouldSendTo: [] as Array<{ userEmail: string; resellerId: string; nextActionAt: string | null }>,
    resendResponses: [] as Array<{ userEmail: string; resellerId: string; resendId: string | null }>,
    resendAttempted: false
  };

  const leads = await fetchLeadsDueWithinOneHour(windowStartIso, windowEndIso);
  summary.checkedLeads = leads.length;

  for (const lead of leads) {
    const assignedUserId = lead.assigned_to;
    const nextActionAt = lead.next_action_at;

    if (!assignedUserId || !nextActionAt) {
      summary.skippedEmails += 1;
      summary.skippedReasons.missing_assignee_or_due_at =
        (summary.skippedReasons.missing_assignee_or_due_at ?? 0) + 1;
      continue;
    }

    const assignedUser = userById.get(assignedUserId);
    if (!assignedUser) {
      summary.skippedEmails += 1;
      summary.skippedReasons.assigned_user_not_found = (summary.skippedReasons.assigned_user_not_found ?? 0) + 1;
      continue;
    }
    if (!assignedUser.is_active) {
      summary.skippedEmails += 1;
      summary.skippedReasons.assigned_user_inactive = (summary.skippedReasons.assigned_user_inactive ?? 0) + 1;
      continue;
    }
    const adminEmail = assignedUser.email?.trim();
    if (!adminEmail) {
      summary.skippedEmails += 1;
      summary.skippedReasons.assigned_user_missing_email = (summary.skippedReasons.assigned_user_missing_email ?? 0) + 1;
      continue;
    }

    try {
      const alreadySent = await hasReminderNotification(lead.id, nextActionAt);
      if (alreadySent) {
        summary.skippedEmails += 1;
        summary.skippedReasons.already_sent = (summary.skippedReasons.already_sent ?? 0) + 1;
        continue;
      }
      summary.eligibleLeads += 1;

      if (params.dryRun) {
        summary.wouldSendTo.push({ userEmail: adminEmail, resellerId: lead.id, nextActionAt });
        continue;
      }

      const rateLimit = checkEmailRateLimit(adminEmail, 'partner_1h_reminder');
      if (rateLimit.blocked) {
        summary.skippedEmails += 1;
        summary.skippedReasons.rate_limited = (summary.skippedReasons.rate_limited ?? 0) + 1;
        continue;
      }

      const email = buildPartnerOneHourReminderEmail(toLeadItem(lead));
      summary.resendAttempted = true;
      const resendResponse = await sendEmailWithResend({
        from: senderEmail,
        to: adminEmail,
        subject: email.subject,
        html: email.html,
        replyTo: [REPLY_TO_EMAIL]
      });
      summary.resendResponses.push({
        userEmail: adminEmail,
        resellerId: lead.id,
        resendId: typeof resendResponse.id === 'string' ? resendResponse.id : null
      });

      await insertNotificationLogs([
        {
          notification_type: 'partner_1h_reminder',
          crm_type: 'partner',
          recipient_user_id: assignedUserId,
          recipient_email: adminEmail,
          reseller_application_id: lead.id,
          next_action_at_snapshot: nextActionAt
        }
      ]);

      markEmailSent(adminEmail, 'partner_1h_reminder');
      summary.sentEmails += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ismeretlen hiba';
      console.error('[cron][partner-task-reminders] Reminder processing failed', {
        route: '/api/cron/partner-task-reminders',
        userEmail: adminEmail,
        resellerId: lead.id,
        resendError: message,
        supabaseError: message
      });
      summary.resendErrors.push(`${lead.id}: ${message}`);
    }
  }

  return summary;
}
