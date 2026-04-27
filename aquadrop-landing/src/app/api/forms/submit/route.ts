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
  };
};

type SubmitRequest = AnnouncementSubmitRequest | GiftSubmitRequest | ResellerSubmitRequest;

type SupabaseOperation = 'select' | 'insert';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
        await insertRow('gift_claims', {
          full_name: normalizedFullName,
          email: normalizedEmail,
          phone: normalizedPhone,
          shipping_address: normalizedShippingAddress,
          purchase_location: normalizedPurchaseLocation,
          purchase_date: normalizedPurchaseDate,
          status: 'Új',
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
        await insertRow('reseller_applications', {
          company_name: normalizedCompanyName,
          contact_name: normalizedContactName,
          email: normalizedEmail,
          phone: normalizedPhone,
          website: normalizedWebsite,
          sales_channel: normalizedSalesChannel,
          message: normalizedMessage
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
