import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { fetchAdminTableRowById, insertGiftActivityLogs } from '@/lib/admin/supabase-admin';
import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import { renderBrandedEmailLayout } from '@/lib/email/templates';
import { buildGiftClaimStatusUrl } from '@/lib/gift/status';

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
  status_token: string | null;
  pipeline_status: string | null;
  receipt_check_status: string | null;
  receipt_check_note: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
};

const REPLY_TO_EMAIL = 'hello@aquadrop.hu';
const GIFT_STATUS_CTA_TEXT = 'Igénylési folyamat állapota';
const GOOGLE_REVIEW_URL = 'https://g.page/r/CT2R_at_xJV6EAE/review';

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

function resolveGiftStatusUrl(statusToken: string | null, context: { giftClaimId: string; type: NotificationType }): string | null {
  const normalizedToken = normalizeText(statusToken);
  if (!normalizedToken) {
    console.warn('[gift-notification] Missing status_token, skipping status CTA.', context);
    return null;
  }

  return buildGiftClaimStatusUrl(normalizedToken);
}

function withGiftToken(subject: string, statusToken: string | null): string {
  const token = normalizeText(statusToken);
  return token ? `${subject} [#gift:${token}]` : subject;
}

function buildSubject(type: NotificationType, subject: string, statusToken: string | null): string {
  return type === 'elutasitas' ? withGiftToken(subject, statusToken) : subject;
}

function buildReplyTo(type: NotificationType): string | string[] {
  if (type !== 'elutasitas') return REPLY_TO_EMAIL;
  const inboundReplyTo = normalizeText(process.env.GIFT_INBOUND_REPLY_TO);
  return inboundReplyTo ? [REPLY_TO_EMAIL, inboundReplyTo] : REPLY_TO_EMAIL;
}

function resolveNotificationType(row: GiftClaimNotificationRow):
  | { type: NotificationType; missingConditions: string[] }
  | { type: null; missingConditions: string[] } {
  const pipelineStatus = normalizeText(row.pipeline_status);
  const receiptCheckStatus = normalizeText(row.receipt_check_status);
  const receiptCheckNote = normalizeText(row.receipt_check_note);
  const courierName = normalizeText(row.courier_name);
  const trackingNumber = normalizeText(row.tracking_number);

  if (pipelineStatus === 'Hiánypótlás szükséges') {
    const missingConditions: string[] = [];

    if (!['Nem olvasható', 'Nem megfelelő termék'].includes(receiptCheckStatus)) {
      missingConditions.push('receipt_check_status legyen "Nem olvasható" vagy "Nem megfelelő termék"');
    }

    if (!receiptCheckNote) {
      missingConditions.push('receipt_check_note nem lehet üres');
    }

    return missingConditions.length > 0 ? { type: null, missingConditions } : { type: 'hianypotlas', missingConditions: [] };
  }

  if (pipelineStatus === 'Jóváhagyva') {
    const missingConditions: string[] = [];

    if (receiptCheckStatus !== 'Érvényes blokk') {
      missingConditions.push('receipt_check_status legyen "Érvényes blokk"');
    }

    return missingConditions.length > 0 ? { type: null, missingConditions } : { type: 'jovahagyas', missingConditions: [] };
  }

  if (pipelineStatus === 'Futárnak átadva') {
    const missingConditions: string[] = [];

    if (!courierName) {
      missingConditions.push('courier_name nem lehet üres');
    }

    if (!trackingNumber) {
      missingConditions.push('tracking_number nem lehet üres');
    }

    return missingConditions.length > 0 ? { type: null, missingConditions } : { type: 'szallitas', missingConditions: [] };
  }

  if (pipelineStatus === 'Elutasítva') {
    const missingConditions: string[] = [];

    if (!['Duplikált blokk gyanú', 'Elutasítva'].includes(receiptCheckStatus)) {
      missingConditions.push('receipt_check_status legyen "Duplikált blokk gyanú" vagy "Elutasítva"');
    }

    return missingConditions.length > 0 ? { type: null, missingConditions } : { type: 'elutasitas', missingConditions: [] };
  }

  return {
    type: null,
    missingConditions: [
      'pipeline_status legyen az alábbiak egyike: Hiánypótlás szükséges, Jóváhagyva, Futárnak átadva, Elutasítva'
    ]
  };
}

function buildNotificationEmail(type: NotificationType, row: GiftClaimNotificationRow): { subject: string; html: string } {
  const fullName = escapeHtml(normalizeText(row.full_name) || 'Vásárlónk');
  const receiptCheckNote = escapeHtml(normalizeText(row.receipt_check_note) || '—');
  const courierName = escapeHtml(normalizeText(row.courier_name) || '—');
  const trackingNumber = escapeHtml(normalizeText(row.tracking_number) || '—');
  const trackingUrl = escapeHtml(normalizeText(row.tracking_url) || '—');
  const statusUrl = type === 'elutasitas' ? null : resolveGiftStatusUrl(row.status_token, { giftClaimId: row.id, type });

  if (type === 'hianypotlas') {
    const subject = 'Hiánypótlás szükséges az ajándékigényléshez';
    const bodyHtml = `
      <p style="margin: 0 0 16px;">Szia ${fullName}!</p>
      <p style="margin: 0 0 16px;">Az ajándékigénylésed feldolgozásához hiánypótlás szükséges.</p>
      <p style="margin: 0;"><strong>Megjegyzés:</strong> ${receiptCheckNote}</p>
    `;

    return {
      subject: buildSubject(type, subject, row.status_token),
      html: renderBrandedEmailLayout({
        subject,
        headline: 'Hiánypótlás szükséges',
        bodyHtml,
        ctaText: statusUrl ? GIFT_STATUS_CTA_TEXT : undefined,
        ctaUrl: statusUrl ?? undefined
      })
    };
  }

  if (type === 'jovahagyas') {
    const subject = 'Jóváhagytuk az ajándékigénylésed';
    const bodyHtml = `
      <p style="margin: 0 0 16px;">Szia ${fullName}!</p>
      <p style="margin: 0 0 16px;">Örömmel jelezzük, hogy az ajándékigénylésedet jóváhagytuk. Hamarosan küldjük a csomagot.</p>
      <div style="margin: 0; padding: 12px 14px; border: 1px solid #bae6fd; border-radius: 12px; background: #f0f9ff;">
        <p style="margin: 0 0 8px;">Mivel az igényléshez már meglévő Aquadrop Expert Pro vásárlás szükséges, örömmel vesszük, ha megírod röviden a tapasztalatodat a mosókapszula használatáról egy Google értékelésben.</p>
        <p style="margin: 0;"><a href="${GOOGLE_REVIEW_URL}" style="color: #0369a1; font-weight: 600;">Google értékelést írok</a></p>
      </div>
    `;

    return {
      subject: buildSubject(type, subject, row.status_token),
      html: renderBrandedEmailLayout({
        subject,
        headline: 'Sikeres jóváhagyás',
        bodyHtml,
        ctaText: statusUrl ? GIFT_STATUS_CTA_TEXT : undefined,
        ctaUrl: statusUrl ?? undefined
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
      <p style="margin: 0 0 16px;"><strong>Tracking URL:</strong> ${trackingUrl}</p>
      <p style="margin: 0; color: #334155;">Köszönjük, hogy az Aquadrop Expert Pro-t választottad. Ha már használtad a korábban vásárolt terméket, örülünk, ha pár szóban megosztod a tapasztalatodat Google értékelésben. <a href="${GOOGLE_REVIEW_URL}" style="color: #0369a1; font-weight: 600;">Google értékelést írok</a></p>
    `;

    return {
      subject: buildSubject(type, subject, row.status_token),
      html: renderBrandedEmailLayout({
        subject,
        headline: 'Csomag feladva',
        bodyHtml,
        ctaText: statusUrl ? GIFT_STATUS_CTA_TEXT : undefined,
        ctaUrl: statusUrl ?? undefined
      })
    };
  }

  const receiptCheckStatus = normalizeText(row.receipt_check_status);

  if (receiptCheckStatus === 'Duplikált blokk gyanú') {
    const subject = 'Igénylés elutasítva – Aquadrop Expert Pro';
    const bodyHtml = `
      <p style="margin: 0 0 16px;">Szia ${fullName}!</p>
      <p style="margin: 0 0 16px;">Sajnáljuk, de az ajándékigénylésedet nem tudjuk jóváhagyni.</p>
      <p style="margin: 0 0 16px;">A rendszerünk szerint ezzel a blokkal már korábban igényeltek ajándék terméket.</p>
      <p style="margin: 0;">Amennyiben úgy gondolod, hogy félreértés történt, kérjük válaszolj erre az emailre, és írd meg észrevételeidet. Ügyfélszolgálatunk kivizsgálja az esetet.</p>
    `;

    return {
      subject: buildSubject(type, subject, row.status_token),
      html: renderBrandedEmailLayout({
        subject,
        headline: 'Igénylés elutasítva',
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
    subject: buildSubject(type, subject, row.status_token),
    html: renderBrandedEmailLayout({
      subject,
      headline: 'Igénylés elutasítva',
      bodyHtml
    })
  };
}

export async function POST(request: Request) {
  const debugResponse = {
    success: false,
    notificationType: null as NotificationType | null,
    recipientEmail: null as string | null,
    resendAttempted: false,
    resendResponse: null as Record<string, unknown> | null,
    resendError: null as string | null,
    validationPassed: false,
    missingConditions: [] as string[]
  };
  const sessionUser = await requireAdminSession(['admin', 'crm_user']);

  if (!sessionUser) {
    return NextResponse.json(
      { ...debugResponse, missingConditions: ['crm_session_missing_or_unauthorized'], error: 'Nincs CRM jogosultság.' },
      { status: 403 }
    );
  }

  let body: SendNotificationRequest;

  try {
    body = (await request.json()) as SendNotificationRequest;
  } catch (error) {
    console.error('[gift-notification] Invalid JSON payload', error);
    return NextResponse.json(
      { ...debugResponse, missingConditions: ['invalid_json_payload'], error: 'Hibás kérés.' },
      { status: 400 }
    );
  }

  if (!body.giftClaimId) {
    return NextResponse.json(
      { ...debugResponse, missingConditions: ['giftClaimId_missing'], error: 'Hiányzó giftClaimId.' },
      { status: 400 }
    );
  }

  try {
    const row = (await fetchAdminTableRowById('gift_claims', body.giftClaimId)) as GiftClaimNotificationRow | null;

    if (!row) {
      return NextResponse.json(
        { ...debugResponse, missingConditions: ['gift_claim_not_found'], error: 'A rekord nem található.' },
        { status: 404 }
      );
    }

    const recipientEmail = normalizeText(row.email);
    debugResponse.recipientEmail = recipientEmail || null;
    if (!recipientEmail) {
      return NextResponse.json(
        {
          ...debugResponse,
          error: 'Nem teljesülnek az email küldés feltételei',
          missingConditions: ['email nem lehet üres']
        },
        { status: 400 }
      );
    }

    const resolved = resolveNotificationType(row);
    debugResponse.notificationType = resolved.type;
    debugResponse.missingConditions = resolved.missingConditions;

    if (!resolved.type) {
      return NextResponse.json(
        {
          ...debugResponse,
          error: 'Nem teljesülnek az email küldés feltételei',
          missingConditions: resolved.missingConditions
        },
        { status: 400 }
      );
    }

    const from = resolveAquadropSenderEmail({ allowFallback: true });
    const template = buildNotificationEmail(resolved.type, row);
    debugResponse.validationPassed = Boolean(template.subject && template.html);
    if (!row.status_token && resolved.type !== 'elutasitas') {
      debugResponse.missingConditions.push('status_token missing (email sent without status CTA)');
    }

    try {
      debugResponse.resendAttempted = true;
      debugResponse.resendResponse = await sendEmailWithResend({
        from,
        to: recipientEmail,
        subject: template.subject,
        html: template.html,
        replyTo: buildReplyTo(resolved.type)
      });
    } catch (error) {
      debugResponse.resendError = error instanceof Error ? error.message : 'Unknown Resend error';
      return NextResponse.json(
        {
          ...debugResponse,
          error: 'Sikertelen email küldés.'
        },
        { status: 502 }
      );
    }

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
      ...debugResponse,
      success: true
    });
  } catch (error) {
    console.error('[gift-notification] Unexpected failure', {
      giftClaimId: body.giftClaimId,
      error
    });

    return NextResponse.json({ ...debugResponse, error: 'Sikertelen email küldés.' }, { status: 500 });
  }
}
