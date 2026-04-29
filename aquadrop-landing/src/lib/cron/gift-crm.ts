import { getBudapestNow } from '@/lib/datetime/budapest';
import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import { renderBrandedEmailLayout } from '@/lib/email/templates';

const STATUSES = ['Új igénylés', 'Blokk ellenőrzés alatt', 'Hiánypótlás szükséges', 'Csomagolás alatt'] as const;
type GiftPipelineStatus = (typeof STATUSES)[number];
type GiftStatusCounts = Record<GiftPipelineStatus, number>;

type GiftClaimRow = {
  id: string;
  pipeline_status: string | null;
};

type GiftSummaryBase = {
  success: true;
  nowUtc: string;
  nowBudapest: string;
  checkedUsers: number;
  checkedLeads: number;
  eligibleLeads: number;
  wouldSendTo: string[];
  sentEmails: number;
  skippedReasons: Record<string, number>;
  resendErrors: string[];
  dryRun: boolean;
};

type GiftDailySummaryResult = GiftSummaryBase & {
  counts?: GiftStatusCounts;
  resendAttempted?: boolean;
  resendId?: string | null;
};

function headers(): HeadersInit {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  };
}

function rest(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  return `${supabaseUrl.replace(/\/$/, '')}/rest/v1`;
}

function isGiftClaimRow(value: unknown): value is GiftClaimRow {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string' && (typeof candidate.pipeline_status === 'string' || candidate.pipeline_status === null);
}

function parseGiftClaimRows(value: unknown): GiftClaimRow[] {
  if (!Array.isArray(value)) {
    throw new Error('Unexpected gift_claims response format.');
  }

  const rows: GiftClaimRow[] = [];
  for (const item of value) {
    if (!isGiftClaimRow(item)) {
      throw new Error('Invalid gift_claims row in response.');
    }
    rows.push(item);
  }

  return rows;
}

function buildEmptyCounts(): GiftStatusCounts {
  return {
    'Új igénylés': 0,
    'Blokk ellenőrzés alatt': 0,
    'Hiánypótlás szükséges': 0,
    'Csomagolás alatt': 0
  };
}

function isGiftPipelineStatus(status: string): status is GiftPipelineStatus {
  return (STATUSES as readonly string[]).includes(status);
}

export async function runGiftDailySummaryCron(params: { dryRun: boolean; debug?: boolean }): Promise<GiftDailySummaryResult> {
  const now = getBudapestNow();
  const summary: GiftDailySummaryResult = {
    success: true,
    nowUtc: now.nowUtc,
    nowBudapest: now.nowBudapest,
    checkedUsers: 1,
    checkedLeads: 0,
    eligibleLeads: 0,
    wouldSendTo: [],
    sentEmails: 0,
    skippedReasons: {},
    resendErrors: [],
    dryRun: params.dryRun
  };

  if (!(now.hour === 8 || now.hour === 13)) {
    summary.skippedReasons.outside_window = 1;
    return summary;
  }

  const q = new URLSearchParams({
    select: 'id,pipeline_status',
    pipeline_status: `in.(${STATUSES.join(',')})`,
    limit: '5000'
  });

  const response = await fetch(`${rest()}/gift_claims?${q.toString()}`, {
    headers: headers(),
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }

  const rows = parseGiftClaimRows(await response.json());
  summary.checkedLeads = rows.length;

  const counts = buildEmptyCounts();
  rows.forEach((row) => {
    if (row.pipeline_status && isGiftPipelineStatus(row.pipeline_status)) {
      counts[row.pipeline_status] += 1;
    }
  });

  const total = Object.values(counts).reduce((acc, value) => acc + value, 0);
  if (total === 0) {
    summary.skippedReasons.no_tasks = 1;
    return { ...summary, counts };
  }

  const subject = '🔥 Mai ajándék elbírálások – Aquadrop CRM Gift';
  const html = renderBrandedEmailLayout({
    subject,
    headline: 'Mai ajándék elbírálások',
    bodyHtml: `<p><strong>${counts['Új igénylés']}</strong> új</p><p><strong>${counts['Blokk ellenőrzés alatt']}</strong> ellenőrzés alatt</p><p><strong>${counts['Hiánypótlás szükséges']}</strong> hiánypótlás</p><p><strong>${counts['Csomagolás alatt']}</strong> csomagolás</p>`,
    ctaText: 'Admin megnyitása',
    ctaUrl: 'https://www.aquadrop.hu/admin?tab=gift_claims'
  });

  summary.wouldSendTo = ['admin@aquadrop.hu'];
  summary.eligibleLeads = total;

  if (params.dryRun) {
    return { ...summary, counts };
  }

  const from = resolveAquadropSenderEmail({ allowFallback: true });
  const resend = await sendEmailWithResend({
    from,
    to: 'admin@aquadrop.hu',
    subject,
    html,
    replyTo: ['hello@aquadrop.hu']
  });

  summary.sentEmails = 1;
  summary.resendAttempted = true;
  summary.resendId = resend?.id ?? null;

  return { ...summary, counts };
}
