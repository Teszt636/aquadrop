import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { fetchAdminTableRowById, insertGiftActivityLogs } from '@/lib/admin/supabase-admin';
import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import { renderBrandedEmailLayout } from '@/lib/email/templates';

type NotificationType = 'hianypotlas' | 'jovahagyas' | 'szallitas' | 'elutasitas';

type SendNotificationRequest = {
  giftClaimId?: string;
  changed_by_user_id?: string | null;
  changed_by_name?: string | null;
  changed_by_email?: string | null;
};

type GiftClaimNotificationRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  pipeline_status: string | null;
  receipt_check_status: string | null;
  receipt_check_note: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
};

const REPLY_TO_EMAIL = 'hello@aquadrop.hu';

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\"', '&quot;')
    .replaceAll("'", '&#39;');
}

function resolveNotificationType(row: GiftClaimNotificationRow):
  | { type: NotificationType; missingConditions: string[] }
  | { type: null; missingConditions: string[] } {
  const pipelineStatus = normalizeText(row.pipeline_status);
  const receiptCheckStatus = normalizeText(row.receipt_check_status);
  const receiptCheckNote = normalizeText(row.receipt_check_note);
  const courierName = normalizeText(row.courier_name);
  const trackingNumber = normalizeText(row.tracking_number);

  if (pipelineStatus === 'Hianypotlas') {
    const missingConditions: string[] = [];

    if (!['Nem olvasható', 'Nem megfelelő termék'].includes(receiptCheckStatus)) {
      missingConditions.push('receipt_check_status legyen "Nem olvasható" vagy "Nem megfelelő termék"');
    }

    if (!receiptCheckNote) {
      missingConditions.push('receipt_check_note nem lehet üres');
    }

    return missingConditions.length > 0 ? { type: null, missingConditions } : { type: 'hianypotlas', missingConditions: [] };
  }

  if (pipelineStatus === 'Jovahagyva') {
    const missingConditions: string[] = [];

    if (receiptCheckStatus !== 'Ervenyes') {
      missingConditions.push('receipt_check_status legyen "Ervenyes"');
    }

    return missingConditions.length > 0 ? { type: null, missingConditions } : { type: 'jovahagyas', missingConditions: [] };
  }

  if (pipelineStatus === 'Futarnak atadva') {
    const missingConditions: string[] = [];

    if (!courierName) {
      missingConditions.push('courier_name nem lehet üres');
    }

    if (!trackingNumber) {
      missingConditions.push('tracking_number nem lehet üres');
    }

    return missingConditions.length > 0 ? { type: null, missingConditions } : { type: 'szallitas', missingConditions: [] };
  }

  if (pipelineStatus === 'Elutasitva') {
    const missingConditions: string[] = [];

    if (!['Duplikalt blokk', 'Elutasitva'].includes(receiptCheckStatus)) {
      missingConditions.push('receipt_check_status legyen "Duplikalt blokk" vagy "Elutasitva"');
    }

    return missingConditions.length > 0 ? { type: null, missingConditions } : { type: 'elutasitas', missingConditions: [] };
  }

  return {
    type: null,
    missingConditions: [
      'pipeline_status legyen az alábbiak egyike: Hianypotlas, Jovahagyva, Futarnak atadva, Elutasitva'
    ]
  };
}

function buildNotificationEmail(type: NotificationType, row: GiftClaimNotificationRow): { subject: string; html: string } {
  const fullName = escapeHtml(normalizeText(row.full_name) || 'Vásárlónk');
  const receiptCheckNote = escapeHtml(normalizeText(row.receipt_check_note) || '—');
  const courierName = escapeHtml(normalizeText(row.courier_name) || '—');
  const trackingNumber = escapeHtml(normalizeText(row.tracking_number) || '—');
  const trackingUrl = escapeHtml(normalizeText(row.tracking_url) || '—');

  if (type === 'hianypotlas') {
    const subject = 'Hiánypótlás szükséges az ajándékigényléshez';
    const bodyHtml = `
      <p style="margin: 0 0 16px;">Szia ${fullName}!</p>
      <p style="margin: 0 0 16px;">Az ajándékigénylésed feldolgozásához hiánypótlás szükséges.</p>
      <p style="margin: 0;"><strong>Megjegyzés:</strong> ${receiptCheckNote}</p>
    `;

    return {
      subject,
      html: renderBrandedEmailLayout({
        subject,
        headline: 'Hiánypótlás szükséges',
        bodyHtml
      })
    };
  }

  if (type === 'jovahagyas') {
    const subject = 'Jóváhagytuk az ajándékigénylésed';
    const bodyHtml = `
      <p style="margin: 0 0 16px;">Szia ${fullName}!</p>
      <p style="margin: 0;">Örömmel jelezzük, hogy az ajándékigénylésedet jóváhagytuk. Hamarosan küldjük a csomagot.</p>
    `;

    return {
      subject,
      html: renderBrandedEmailLayout({
        subject,
        headline: 'Sikeres jóváhagyás',
        bodyHtml
      })
    };
  }

  if (type === 'szallitas') {
    const subject = 'Átadtuk a futárnak az ajándékcsomagod';
    const bodyHtml = `
      <p style="margin: 0 0 16px;">Szia ${fullName}!</p>
      <p style="margin: 0 0 16px;">A csomagod átadásra került a futárszolgálatnak.</p>
      <p style="margin: 0 0 8px;"><strong>Futárszolgálat:</strong> ${courierName}</p>
      <p style="margin: 0 0 8px;"><strong>Tracking szám:</strong> ${trackingNumber}</p>
      <p style="margin: 0;"><strong>Tracking URL:</strong> ${trackingUrl}</p>
    `;

    return {
      subject,
      html: renderBrandedEmailLayout({
        subject,
        headline: 'Csomag feladva',
        bodyHtml
      })
    };
  }

  const subject = 'Sajnáljuk, az ajándékigénylésed elutasításra került';
  const bodyHtml = `
    <p style="margin: 0 0 16px;">Szia ${fullName}!</p>
    <p style="margin: 0;">Sajnáljuk, de az ajándékigénylésedet nem tudjuk jóváhagyni.</p>
  `;

  return {
    subject,
    html: renderBrandedEmailLayout({
      subject,
      headline: 'Igénylés elutasítva',
      bodyHtml
    })
  };
}

export async function POST(request: Request) {
  const sessionUser = await requireAdminSession(['admin', 'crm_user']);

  if (!sessionUser) {
    return NextResponse.json({ success: false, error: 'Nincs CRM jogosultság.' }, { status: 403 });
  }

  let body: SendNotificationRequest;

  try {
    body = (await request.json()) as SendNotificationRequest;
  } catch (error) {
    console.error('[gift-notification] Invalid JSON payload', error);
    return NextResponse.json({ success: false, error: 'Hibás kérés.' }, { status: 400 });
  }

  if (!body.giftClaimId) {
    return NextResponse.json({ success: false, error: 'Hiányzó giftClaimId.' }, { status: 400 });
  }

  try {
    const row = (await fetchAdminTableRowById('gift_claims', body.giftClaimId)) as GiftClaimNotificationRow | null;

    if (!row) {
      return NextResponse.json({ success: false, error: 'A rekord nem található.' }, { status: 404 });
    }

    const recipientEmail = normalizeText(row.email);
    if (!recipientEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nem teljesülnek az email küldés feltételei',
          missingConditions: ['email nem lehet üres']
        },
        { status: 400 }
      );
    }

    const resolved = resolveNotificationType(row);

    if (!resolved.type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nem teljesülnek az email küldés feltételei',
          missingConditions: resolved.missingConditions
        },
        { status: 400 }
      );
    }

    const from = resolveAquadropSenderEmail({ allowFallback: true });
    const template = buildNotificationEmail(resolved.type, row);

    await sendEmailWithResend({
      from,
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      replyTo: REPLY_TO_EMAIL
    });

    try {
      await insertGiftActivityLogs([
        {
          gift_claim_id: row.id,
          changed_by_user_id: body.changed_by_user_id ?? sessionUser.id ?? null,
          changed_by_name: body.changed_by_name ?? sessionUser.name ?? null,
          changed_by_email: body.changed_by_email ?? sessionUser.email ?? null,
          field_name: 'notification_email',
          old_value: null,
          new_value: resolved.type,
          change_summary: `Értesítő email kiküldve (${resolved.type}).`
        }
      ]);
    } catch (activityLogError) {
      console.error('[gift-notification] Failed to insert activity log entry', {
        giftClaimId: row.id,
        notificationType: resolved.type,
        error: activityLogError
      });
    }

    return NextResponse.json({
      success: true,
      type: resolved.type
    });
  } catch (error) {
    console.error('[gift-notification] Unexpected failure', {
      giftClaimId: body.giftClaimId,
      error
    });

    return NextResponse.json({ success: false, error: 'Sikertelen email küldés.' }, { status: 500 });
  }
}
