import { NextResponse } from 'next/server';

import { sendFormNotifications } from '@/lib/email/notifications';
import type { EmailNotificationRequest } from '@/lib/email/types';

type AnnouncementSubmitRequest = {
  formType: 'announcement_signup';
  payload: {
    name: string;
    email: string;
    phone: string | null;
    consent: boolean;
  };
};

type GiftSubmitRequest = {
  formType: 'gift_claim';
  payload: {
    full_name: string;
    email: string;
    phone: string;
    shipping_address: string;
    purchase_location: string;
    purchase_date: string;
    consent: boolean;
    purchase_declaration: boolean;
    receipt_url: string | null;
    receipt_path: string | null;
  };
};

type ResellerSubmitRequest = {
  formType: 'reseller_application';
  payload: {
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    website: string | null;
    sales_channel: string;
    message: string | null;
    assigned_to?: string | null;
  };
};

type MediaKitSubmitRequest = {
  formType: 'media_kit_download';
  payload: {
    name: string;
    email: string;
    company: string | null;
    usage_type: string;
    downloaded_file: string;
  };
};

type SubmitRequest =
  | AnnouncementSubmitRequest
  | GiftSubmitRequest
  | ResellerSubmitRequest
  | MediaKitSubmitRequest;

type SupabaseOperation = 'select' | 'insert';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FREE_EMAIL_DOMAINS = ['gmail.com', 'freemail.hu', 'citromail.hu', 'yahoo.com', 'hotmail.com'];

function getNextBusinessDayTenAmIso(from = new Date()): string {
  const next = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 10, 0, 0, 0));
  do {
    next.setUTCDate(next.getUTCDate() + 1);
  } while (next.getUTCDay() === 0 || next.getUTCDay() === 6);
  return next.toISOString();
}

function calculateInitialResellerLeadScore(payload: {
  companyName: string;
  email: string;
  phone: string;
  website: string | null;
  salesChannel: string;
  message: string | null;
}): number {
  let score = 0;

  if (payload.companyName.trim()) score += 10;
  if (payload.phone.trim()) score += 10;
  if (payload.website?.trim()) score += 15;

  const channel = payload.salesChannel.trim().toLocaleLowerCase('hu-HU');
  if (channel.includes('nagyker') || channel.includes('webshop') || channel.includes('üzlet')) {
    score += 20;
  }

  if ((payload.message?.trim().length ?? 0) >= 40) {
    score += 10;
  }

  const domain = payload.email.split('@')[1]?.trim().toLocaleLowerCase('hu-HU');
  if (domain && !FREE_EMAIL_DOMAINS.includes(domain)) {
    score += 15;
  }

  return Math.min(score, 100);
}

function getRestUrl(table: string, query?: URLSearchParams): string {
  if (!SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.');
  }

  const base = `${SUPABASE_URL}/rest/v1/${table}`;
  return query ? `${base}?${query.toString()}` : base;
}

function getServiceRoleHeaders(prefer?: string): HeadersInit {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing.');
  }

  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {})
  };
}

async function selectRows<TResponse = unknown>(table: string, query: URLSearchParams): Promise<TResponse[]> {
  const response = await fetch(getRestUrl(table, query), {
    method: 'GET',
    headers: getServiceRoleHeaders()
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Supabase select failed (${response.status}): ${errorText}`) as Error & {
      operation?: SupabaseOperation;
      supabaseErrorText?: string;
      table?: string;
    };
    error.operation = 'select';
    error.supabaseErrorText = errorText;
    error.table = table;
    throw error;
  }

  return (await response.json()) as TResponse[];
}

async function insertRow(table: string, payload: Record<string, unknown>): Promise<void> {
  const response = await fetch(getRestUrl(table), {
    method: 'POST',
    headers: getServiceRoleHeaders('return=minimal'),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Supabase insert failed (${response.status}): ${errorText}`) as Error & {
      operation?: SupabaseOperation;
      supabaseErrorText?: string;
      table?: string;
    };
    error.operation = 'insert';
    error.supabaseErrorText = errorText;
    error.table = table;
    throw error;
  }
}

async function getAdminUserIdByName(name: string): Promise<string | null> {
  const query = new URLSearchParams({
    select: 'id',
    name: `eq.${name}`,
    limit: '1'
  });
  const rows = await selectRows<{ id: string }>('admin_users', query);
  return rows[0]?.id ?? null;
}

async function resolveDefaultResellerAssigneeId(explicitAssignedTo: unknown): Promise<string | null> {
  if (typeof explicitAssignedTo === 'string') {
    const normalizedAssignedTo = explicitAssignedTo.trim();
    if (normalizedAssignedTo.length > 0) {
      return normalizedAssignedTo;
    }
    return null;
  }

  const bartokCsabaId = await getAdminUserIdByName('Bartók Csaba');
  if (!bartokCsabaId) {
    console.warn('[forms][submit] Default reseller assignee not found', {
      assigneeName: 'Bartók Csaba',
      formType: 'reseller_application'
    });
  }

  return bartokCsabaId;
}

export async function POST(request: Request) {
  let formType: SubmitRequest['formType'] | 'unknown' = 'unknown';

  try {
    const body = (await request.json()) as SubmitRequest;
    formType = body.formType;

    if (body.formType === 'announcement_signup') {
      const normalizedEmail = body.payload.email.trim().toLowerCase();
      const normalizedName = body.payload.name.trim();
      const normalizedPhone = body.payload.phone?.trim() || null;

      const duplicateQuery = new URLSearchParams({
        select: 'id',
        email: `eq.${normalizedEmail}`,
        limit: '1'
      });
      const existingRows = await selectRows<{ id: number }>('announcement_signups', duplicateQuery);
      const duplicateDetected = existingRows.length > 0;
      const insertSkipped = duplicateDetected;

      if (!duplicateDetected) {
        await insertRow('announcement_signups', {
          name: normalizedName,
          email: normalizedEmail,
          phone: normalizedPhone,
          consent: body.payload.consent
        });
      }

      const notificationType: EmailNotificationRequest['type'] = duplicateDetected
        ? 'announcement_signup_exists'
        : 'announcement_signup';

      console.info('[forms][submit]', {
        formType: body.formType,
        duplicateDetected,
        notificationType,
        insertSkipped
      });

      await sendFormNotifications({
        type: notificationType,
        payload: {
          name: normalizedName,
          email: normalizedEmail,
          phone: normalizedPhone
        }
      });

      return NextResponse.json({ success: true, duplicate: duplicateDetected });
    }

    if (body.formType === 'gift_claim') {
      const normalizedFullName = body.payload.full_name.trim();
      const normalizedEmail = body.payload.email.trim().toLowerCase();
      const normalizedPhone = body.payload.phone.trim();
      const normalizedShippingAddress = body.payload.shipping_address.trim();
      const normalizedPurchaseLocation = body.payload.purchase_location.trim();
      const normalizedPurchaseDate = body.payload.purchase_date.trim();
      const normalizedReceiptUrl = body.payload.receipt_url?.trim() || null;
      const normalizedReceiptPath = body.payload.receipt_path?.trim() || null;

      const duplicateQuery = new URLSearchParams({
        select: 'id',
        or: `(email.eq.${normalizedEmail},phone.eq.${normalizedPhone})`,
        limit: '1'
      });
      const existingRows = await selectRows<{ id: number }>('gift_claims', duplicateQuery);
      const duplicateDetected = existingRows.length > 0;
      const insertSkipped = duplicateDetected;

      if (!duplicateDetected) {
        const createdAt = new Date();
        const nextActionAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
        const defaultAssigneeId = await getAdminUserIdByName('Bartók Csaba');

        await insertRow('gift_claims', {
          full_name: normalizedFullName,
          email: normalizedEmail,
          phone: normalizedPhone,
          shipping_address: normalizedShippingAddress,
          purchase_location: normalizedPurchaseLocation,
          purchase_date: normalizedPurchaseDate,
          status: 'Új',
          pipeline_status: 'Új igénylés',
          receipt_check_status: 'Ellenőrzésre vár',
          shipping_status: 'Nincs előkészítve',
          ai_check_status: 'Nincs ellenőrizve',
          assigned_to: defaultAssigneeId,
          created_at: createdAt.toISOString(),
          next_action_at: nextActionAt.toISOString(),
          next_action_description:
            'Ellenőrizd a feltöltött blokkot, a vásárlás adatait és az igénylés jogosultságát.',
          consent: body.payload.consent,
          purchase_declaration: body.payload.purchase_declaration,
          receipt_url: normalizedReceiptUrl,
          receipt_path: normalizedReceiptPath
        });
      }

      const notificationType: EmailNotificationRequest['type'] = duplicateDetected
        ? 'gift_claim_exists'
        : 'gift_claim';

      console.info('[forms][submit]', {
        formType: body.formType,
        duplicateDetected,
        notificationType,
        insertSkipped
      });

      await sendFormNotifications({
        type: notificationType,
        payload: {
          fullName: normalizedFullName,
          email: normalizedEmail,
          phone: normalizedPhone,
          shippingAddress: normalizedShippingAddress,
          purchaseLocation: normalizedPurchaseLocation,
          purchaseDate: normalizedPurchaseDate,
          receiptUrl: normalizedReceiptUrl
        }
      });

      return NextResponse.json({ success: true, duplicate: duplicateDetected });
    }

    if (body.formType === 'reseller_application') {
      const normalizedCompanyName = body.payload.company_name.trim();
      const normalizedContactName = body.payload.contact_name.trim();
      const normalizedEmail = body.payload.email.trim().toLowerCase();
      const normalizedPhone = body.payload.phone.trim();
      const normalizedWebsite = body.payload.website?.trim() || null;
      const normalizedSalesChannel = body.payload.sales_channel.trim();
      const normalizedMessage = body.payload.message?.trim() || null;

      const duplicateQuery = new URLSearchParams({
        select: 'id',
        email: `eq.${normalizedEmail}`,
        limit: '1'
      });
      const existingRows = await selectRows<{ id: number }>('reseller_applications', duplicateQuery);
      const duplicateDetected = existingRows.length > 0;
      const insertSkipped = duplicateDetected;

      if (!duplicateDetected) {
        const leadScore = calculateInitialResellerLeadScore({
          companyName: normalizedCompanyName,
          email: normalizedEmail,
          phone: normalizedPhone,
          website: normalizedWebsite,
          salesChannel: normalizedSalesChannel,
          message: normalizedMessage
        });
        const isHotLead = leadScore >= 60;
        const assignedTo = await resolveDefaultResellerAssigneeId(body.payload.assigned_to);

        await insertRow('reseller_applications', {
          company_name: normalizedCompanyName,
          contact_name: normalizedContactName,
          email: normalizedEmail,
          phone: normalizedPhone,
          website: normalizedWebsite,
          sales_channel: normalizedSalesChannel,
          message: normalizedMessage,
          assigned_to: assignedTo,
          lead_score: leadScore,
          is_hot_lead: isHotLead,
          next_action_at: getNextBusinessDayTenAmIso()
        });
      }

      const notificationType: EmailNotificationRequest['type'] = duplicateDetected
        ? 'reseller_application_exists'
        : 'reseller_application';

      console.info('[forms][submit]', {
        formType: body.formType,
        duplicateDetected,
        notificationType,
        insertSkipped
      });

      await sendFormNotifications({
        type: notificationType,
        payload: {
          companyName: normalizedCompanyName,
          contactName: normalizedContactName,
          email: normalizedEmail,
          phone: normalizedPhone,
          website: normalizedWebsite,
          salesChannel: normalizedSalesChannel,
          message: normalizedMessage
        }
      });

      return NextResponse.json({ success: true, duplicate: duplicateDetected });
    }

    if (body.formType === 'media_kit_download') {
      const normalizedName = body.payload.name.trim();
      const normalizedEmail = body.payload.email.trim().toLowerCase();
      const normalizedCompany = body.payload.company?.trim() || null;
      const normalizedUsageType = body.payload.usage_type.trim();
      const normalizedDownloadedFile = body.payload.downloaded_file.trim();

      await insertRow('media_kit_downloads', {
        name: normalizedName,
        email: normalizedEmail,
        company: normalizedCompany,
        usage_type: normalizedUsageType,
        downloaded_file: normalizedDownloadedFile
      });

      console.info('[forms][submit]', {
        formType: body.formType
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unsupported form type.' }, { status: 400 });
  } catch (error) {
    const supabaseErrorText =
      error instanceof Error && 'supabaseErrorText' in error ? String(error.supabaseErrorText ?? '') : null;

    console.error('[forms][submit] request failed', {
      formType,
      message: error instanceof Error ? error.message : 'Unexpected submit error',
      supabaseResponseText: supabaseErrorText
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected submit error'
      },
      { status: 500 }
    );
  }
}
