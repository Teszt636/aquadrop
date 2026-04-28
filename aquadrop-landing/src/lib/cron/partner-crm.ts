import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import {
  buildPartnerDailyTasksEmail,
  buildPartnerOneHourReminderEmail,
  type PartnerTaskLeadItem
} from '@/lib/email/templates';

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
const BUDAPEST_TIMEZONE = 'Europe/Budapest';

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

function getCurrentBudapestParts(now = new Date()): { date: string; hour: number } {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUDAPEST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: BUDAPEST_TIMEZONE,
      hour: '2-digit',
      hour12: false
    }).format(now)
  );

  return { date, hour };
}


function getBudapestDateKey(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUDAPEST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(parsed);
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

async function fetchActiveAdminUsers(): Promise<AdminUser[]> {
  const query = new URLSearchParams({
    select: 'id,name,email,is_active',
    is_active: 'eq.true',
    order: 'name.asc',
    limit: '500'
  });

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

export async function runPartnerDailyTasksCron(params: { dryRun: boolean }) {
  const { date: localDate, hour } = getCurrentBudapestParts();
  const senderEmail = resolveAquadropSenderEmail({ allowFallback: true });
  const admins = await fetchActiveAdminUsers();
  const summary = {
    success: true,
    checkedUsers: admins.length,
    sentEmails: 0,
    skippedEmails: 0,
    errors: [] as string[],
    dryRun: params.dryRun,
    skippedByTimeWindow: false,
    wouldSend: [] as Array<{ userEmail: string; overdue: number; today: number; hot: number }>
  };

  if (hour !== 8) {
    summary.skippedByTimeWindow = true;
    summary.skippedEmails = admins.length;
    return summary;
  }

  for (const admin of admins) {
    try {
      const leads = await fetchAssignedOpenLeads(admin.id);
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

      if (overdue.length === 0 && today.length === 0 && hot.length === 0) {
        summary.skippedEmails += 1;
        continue;
      }

      const alreadySent = await hasDailyNotificationForUser(admin.id, localDate);
      if (alreadySent) {
        summary.skippedEmails += 1;
        continue;
      }

      if (params.dryRun) {
        summary.wouldSend.push({
          userEmail: admin.email,
          overdue: overdue.length,
          today: today.length,
          hot: hot.length
        });
        continue;
      }

      const email = buildPartnerDailyTasksEmail({
        overdueLeads: overdue.map(toLeadItem),
        todayLeads: today.map(toLeadItem),
        hotLeads: hot.map(toLeadItem)
      });

      await sendEmailWithResend({
        from: senderEmail,
        to: admin.email,
        subject: email.subject,
        html: email.html,
        replyTo: REPLY_TO_EMAIL
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

      summary.sentEmails += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ismeretlen hiba';
      console.error('[cron][partner-daily-tasks] User processing failed', {
        route: '/api/cron/partner-daily-tasks',
        userEmail: admin.email,
        resendError: message,
        supabaseError: message
      });
      summary.errors.push(`${admin.email}: ${message}`);
    }
  }

  return summary;
}

export async function runPartnerTaskReminderCron(params: { dryRun: boolean }) {
  const senderEmail = resolveAquadropSenderEmail({ allowFallback: true });
  const now = new Date();
  const windowStartIso = now.toISOString();
  const windowEndIso = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  const users = await fetchActiveAdminUsers();
  const userEmailById = new Map(users.map((user) => [user.id, user.email]));

  const summary = {
    success: true,
    checkedUsers: users.length,
    sentEmails: 0,
    skippedEmails: 0,
    errors: [] as string[],
    dryRun: params.dryRun,
    wouldSend: [] as Array<{ userEmail: string; resellerId: string; nextActionAt: string | null }>
  };

  const leads = await fetchLeadsDueWithinOneHour(windowStartIso, windowEndIso);

  for (const lead of leads) {
    const assignedUserId = lead.assigned_to;
    const nextActionAt = lead.next_action_at;

    if (!assignedUserId || !nextActionAt) {
      summary.skippedEmails += 1;
      continue;
    }

    const adminEmail = userEmailById.get(assignedUserId);
    if (!adminEmail) {
      summary.skippedEmails += 1;
      continue;
    }

    try {
      const alreadySent = await hasReminderNotification(lead.id, nextActionAt);
      if (alreadySent) {
        summary.skippedEmails += 1;
        continue;
      }

      if (params.dryRun) {
        summary.wouldSend.push({ userEmail: adminEmail, resellerId: lead.id, nextActionAt });
        continue;
      }

      const email = buildPartnerOneHourReminderEmail(toLeadItem(lead));
      await sendEmailWithResend({
        from: senderEmail,
        to: adminEmail,
        subject: email.subject,
        html: email.html,
        replyTo: REPLY_TO_EMAIL
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
      summary.errors.push(`${lead.id}: ${message}`);
    }
  }

  return summary;
}
