import { checkEmailRateLimit, markEmailSent } from '@/lib/cron/email-safety';
import { getBudapestNow } from '@/lib/datetime/budapest';
import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import { renderBrandedEmailLayout } from '@/lib/email/templates';

export const GIFT_DAILY_SUMMARY_STATUSES = [
  'Új igénylés',
  'Blokk ellenőrzés alatt',
  'Hiánypótlás szükséges',
  'Csomagolás alatt'
] as const;

export type GiftPipelineStatus = (typeof GIFT_DAILY_SUMMARY_STATUSES)[number];
export type GiftStatusCounts = Record<GiftPipelineStatus, number>;

type AdminUser = {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
};

type GiftClaimRow = {
  id: string;
  assigned_to: string | null;
  pipeline_status: string | null;
};

type NotificationLogRow = {
  notification_type: 'gift_daily_summary';
  crm_type: 'gift';
  recipient_user_id: string;
  recipient_email: string;
  notification_date: string;
  notification_slot: string;
};

type GiftDailySummaryResult = {
  success: true;
  nowUtc: string;
  nowBudapest: string;
  checkedUsers: number;
  checkedLeads: number;
  eligibleLeads: number;
  wouldSendTo: Array<{ userEmail: string; slot: string; counts: GiftStatusCounts; ccAdmin: boolean }>;
  sentEmails: number;
  skippedEmails: number;
  skippedReasons: Record<string, number>;
  resendAttempted: boolean;
  resendResponses: Array<{ userEmail: string; resendId: string | null }>;
  resendErrors: string[];
  dryRun: boolean;
};

const GIFT_ADMIN_URL = 'https://www.aquadrop.hu/admin?tab=gift_claims';
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

function buildEmptyCounts(): GiftStatusCounts {
  return {
    'Új igénylés': 0,
    'Blokk ellenőrzés alatt': 0,
    'Hiánypótlás szükséges': 0,
    'Csomagolás alatt': 0
  };
}

function isGiftPipelineStatus(status: string | null): status is GiftPipelineStatus {
  return Boolean(status && (GIFT_DAILY_SUMMARY_STATUSES as readonly string[]).includes(status));
}

function incrementSkip(summary: GiftDailySummaryResult, reason: string, amount = 1): void {
  summary.skippedReasons[reason] = (summary.skippedReasons[reason] ?? 0) + amount;
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

async function fetchAssignedGiftClaims(): Promise<GiftClaimRow[]> {
  const query = new URLSearchParams({
    select: 'id,assigned_to,pipeline_status',
    assigned_to: 'not.is.null',
    pipeline_status: `in.(${GIFT_DAILY_SUMMARY_STATUSES.join(',')})`,
    order: 'pipeline_status.asc',
    limit: '5000'
  });

  const response = await fetch(`${getRestUrl()}/gift_claims?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gift claims: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as GiftClaimRow[];
}

async function hasGiftSummaryNotification(userId: string, date: string, slot: string): Promise<boolean> {
  const query = new URLSearchParams({
    select: 'id',
    notification_type: 'eq.gift_daily_summary',
    crm_type: 'eq.gift',
    recipient_user_id: `eq.${userId}`,
    notification_date: `eq.${date}`,
    notification_slot: `eq.${slot}`,
    limit: '1'
  });

  const response = await fetch(`${getRestUrl()}/crm_email_notifications?${query.toString()}`, {
    method: 'GET',
    headers: getServiceHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to read gift summary notification logs: ${response.status} ${await response.text()}`);
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
    throw new Error(`Failed to insert gift summary notification logs: ${response.status} ${await response.text()}`);
  }
}

export function buildGiftDailySummaryEmail(counts: GiftStatusCounts) {
  const subject = '🔥 Mai ajándék elbírálások – Aquadrop CRM Gift';
  const bodyHtml = `
    <p style="margin: 0 0 8px;"><strong>${counts['Új igénylés']}</strong> db Új igénylés</p>
    <p style="margin: 0 0 8px;"><strong>${counts['Blokk ellenőrzés alatt']}</strong> db Blokk ellenőrzés alatt</p>
    <p style="margin: 0 0 8px;"><strong>${counts['Hiánypótlás szükséges']}</strong> db Hiánypótlás szükséges</p>
    <p style="margin: 0;"><strong>${counts['Csomagolás alatt']}</strong> db Csomagolás alatt</p>
  `;

  return {
    subject,
    html: renderBrandedEmailLayout({
      subject,
      headline: 'Mai ajándék elbírálások',
      bodyHtml,
      ctaText: 'Admin megnyitása',
      ctaUrl: GIFT_ADMIN_URL
    })
  };
}

function hasAnyGiftTasks(counts: GiftStatusCounts): boolean {
  return Object.values(counts).some((count) => count > 0);
}

export async function runGiftDailySummaryCron(params: { dryRun: boolean; debug?: boolean }): Promise<GiftDailySummaryResult> {
  const now = getBudapestNow();
  const slot = String(now.hour).padStart(2, '0');
  const summary: GiftDailySummaryResult = {
    success: true,
    nowUtc: now.nowUtc,
    nowBudapest: now.nowBudapest,
    checkedUsers: 0,
    checkedLeads: 0,
    eligibleLeads: 0,
    wouldSendTo: [],
    sentEmails: 0,
    skippedEmails: 0,
    skippedReasons: {},
    resendAttempted: false,
    resendResponses: [],
    resendErrors: [],
    dryRun: params.dryRun
  };

  const budapestWeekday = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Budapest', weekday: 'short' }).format(
    new Date(now.nowUtc)
  );
  if (['Sat', 'Sun'].includes(budapestWeekday)) {
    incrementSkip(summary, 'weekend');
    return summary;
  }

  if (!(now.hour === 8 || now.hour === 13)) {
    incrementSkip(summary, 'outside_daily_window');
    return summary;
  }

  const admins = await fetchActiveAdminUsers();
  const claims = await fetchAssignedGiftClaims();
  const userById = new Map(admins.map((admin) => [admin.id, admin]));
  const countsByUser = new Map<string, GiftStatusCounts>();

  summary.checkedUsers = admins.length;
  summary.checkedLeads = claims.length;

  for (const claim of claims) {
    if (!claim.assigned_to || !isGiftPipelineStatus(claim.pipeline_status)) {
      continue;
    }

    const assignedUser = userById.get(claim.assigned_to);
    if (!assignedUser) {
      incrementSkip(summary, 'assigned_user_not_found');
      continue;
    }

    const email = assignedUser.email?.trim();
    if (!email) {
      incrementSkip(summary, 'assigned_user_missing_email');
      continue;
    }

    const counts = countsByUser.get(assignedUser.id) ?? buildEmptyCounts();
    counts[claim.pipeline_status] += 1;
    countsByUser.set(assignedUser.id, counts);
    summary.eligibleLeads += 1;
  }

  for (const admin of admins) {
    const email = admin.email?.trim();
    const counts = countsByUser.get(admin.id) ?? buildEmptyCounts();

    if (!email) {
      summary.skippedEmails += 1;
      incrementSkip(summary, 'user_missing_email');
      continue;
    }

    if (!hasAnyGiftTasks(counts)) {
      summary.skippedEmails += 1;
      incrementSkip(summary, 'no_tasks');
      continue;
    }

    try {
      const alreadySent = await hasGiftSummaryNotification(admin.id, now.date, slot);
      if (alreadySent) {
        summary.skippedEmails += 1;
        incrementSkip(summary, 'already_sent');
        continue;
      }

      const ccAdmin = now.hour === 8;
      summary.wouldSendTo.push({ userEmail: email, slot, counts, ccAdmin });

      if (params.dryRun) {
        continue;
      }

      const rateLimit = checkEmailRateLimit(email, `gift_daily_summary_${slot}`);
      if (rateLimit.blocked) {
        summary.skippedEmails += 1;
        incrementSkip(summary, 'rate_limited');
        continue;
      }

      const message = buildGiftDailySummaryEmail(counts);
      summary.resendAttempted = true;
      const resendResponse = await sendEmailWithResend({
        from: resolveAquadropSenderEmail({ allowFallback: true }),
        to: email,
        cc: ccAdmin ? CC_ADMIN_EMAIL : undefined,
        subject: message.subject,
        html: message.html,
        replyTo: [REPLY_TO_EMAIL]
      });

      summary.resendResponses.push({
        userEmail: email,
        resendId: typeof resendResponse.id === 'string' ? resendResponse.id : null
      });

      await insertNotificationLogs([
        {
          notification_type: 'gift_daily_summary',
          crm_type: 'gift',
          recipient_user_id: admin.id,
          recipient_email: email,
          notification_date: now.date,
          notification_slot: slot
        }
      ]);

      markEmailSent(email, `gift_daily_summary_${slot}`);
      summary.sentEmails += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ismeretlen hiba';
      console.error('[cron][gift-daily-summary] User processing failed', {
        route: '/api/cron/gift-daily-summary',
        userEmail: email,
        resendError: message,
        supabaseError: message
      });
      summary.resendErrors.push(`${email}: ${message}`);
    }
  }

  return summary;
}
