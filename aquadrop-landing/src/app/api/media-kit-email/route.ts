import { NextResponse } from 'next/server';

import { resolveAquadropSenderEmail } from '@/lib/email/config';
import { sendEmailWithResend } from '@/lib/email/resend';
import { renderBrandedEmailLayout } from '@/lib/email/templates';

type MediaKitEmailRequest = {
  name?: string;
  email?: string;
  company?: string | null;
  usage_type?: string | null;
  downloaded_file?: string | null;
};

const REPLY_TO_EMAIL = 'hello@aquadrop.hu';
const SITE_URL_FALLBACK = 'https://www.aquadrop.hu';

export const runtime = 'nodejs';

function requireServerEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

function getSupabaseHeaders(): HeadersInit {
  const serviceRoleKey = requireServerEnv('SUPABASE_SERVICE_ROLE_KEY');

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  };
}

function getSiteUrl(): string {
  return process.env.SITE_URL?.replace(/\/$/, '') || SITE_URL_FALLBACK;
}

function toAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function hasResellerApplication(email: string): Promise<boolean> {
  const supabaseUrl = requireServerEnv('NEXT_PUBLIC_SUPABASE_URL').replace(/\/$/, '');

  const query = new URLSearchParams({
    select: 'id',
    email: `eq.${email}`,
    limit: '1'
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/reseller_applications?${query.toString()}`, {
    method: 'GET',
    headers: getSupabaseHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Supabase reseller lookup failed (${response.status}): ${await response.text()}`);
  }

  const rows = (await response.json()) as Array<{ id: number }>;
  return rows.length > 0;
}

function buildDownloadItem(label: string, href: string): string {
  return `<p style="margin: 0 0 10px;"><a href="${escapeHtml(href)}" target="_blank" style="display: block; text-decoration: none; color: #1d4ed8; font-weight: 700; border: 1px solid #dbeafe; border-radius: 10px; background: #eff6ff; padding: 12px 14px;">${escapeHtml(label)}</a></p>`;
}

function buildUserEmailHtml(name: string, isResellerLead: boolean): string {
  const marketingImagesUrl = toAbsoluteUrl('/media-kit/aquadrop-marketing-kepek.zip');
  const productTextsUrl = toAbsoluteUrl('/media-kit/aquadrop-termekszovegek.pdf');
  const safetySheetUrl = toAbsoluteUrl('/media-kit/aquadrop-biztonsagi-adatlap.pdf');
  const partnerUrl = toAbsoluteUrl('/partner');
  const homeUrl = toAbsoluteUrl('/');

  const resellerBlock = isResellerLead
    ? '<p style="margin: 20px 0 0; color: #475569;">Már látjuk a partneri érdeklődésedet, hamarosan felvesszük veled a kapcsolatot a részletekkel.</p>'
    : `<p style="margin: 20px 0 10px; color: #475569;">Ha szeretnél viszonteladóként is csatlakozni, a jelentkezés néhány lépésből áll:</p>
       <ol style="margin: 0 0 16px 20px; padding: 0; color: #475569;">
         <li>űrlap kitöltése</li>
         <li>rövid egyeztetés</li>
         <li>partneri feltételek átbeszélése</li>
         <li>indulhat az együttműködés</li>
       </ol>`;

  return renderBrandedEmailLayout({
    subject: 'Aquadrop Media Kit anyagok',
    headline: 'Aquadrop Media Kit letöltési linkek',
    bodyHtml: `
      <p style="margin: 0 0 16px; color: #475569;">Szia ${escapeHtml(name)}!</p>
      <p style="margin: 0 0 16px; color: #475569;">Köszönjük az érdeklődést. Összegyűjtöttük neked az Aquadrop Expert Pro értékesítéséhez használható anyagokat.</p>
      <p style="margin: 0 0 16px; color: #475569;">A következő linkeken tudod letölteni az anyagokat:</p>
      ${buildDownloadItem('1. Marketing képek', marketingImagesUrl)}
      ${buildDownloadItem('2. Termékszövegek', productTextsUrl)}
      ${buildDownloadItem('3. Biztonsági adatlap', safetySheetUrl)}
      ${resellerBlock}
    `,
    ctaText: isResellerLead ? 'Megnézem a főoldalt' : 'Viszonteladói jelentkezés',
    ctaUrl: isResellerLead ? homeUrl : partnerUrl
  });
}

function buildAdminEmailHtml(payload: {
  name: string;
  email: string;
  company: string | null;
  usageType: string | null;
  downloadedFile: string | null;
  isResellerLead: boolean;
}): string {
  const partnerUrl = toAbsoluteUrl('/partner');
  const resellerStatus = payload.isResellerLead
    ? 'Már jelentkezett viszonteladónak'
    : 'Még nem jelentkezett viszonteladónak';

  return renderBrandedEmailLayout({
    subject: 'Új Media Kit letöltés',
    headline: 'Új Media Kit letöltés',
    bodyHtml: `
      <p style="margin: 0 0 16px; color: #475569;">Új Media Kit letöltés történt.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Név:</strong> ${escapeHtml(payload.name)}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Email:</strong> ${escapeHtml(payload.email)}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Cég:</strong> ${escapeHtml(payload.company ?? '-')}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Felhasználás célja:</strong> ${escapeHtml(payload.usageType ?? '-')}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Elsőként kért fájl:</strong> ${escapeHtml(payload.downloadedFile ?? '-')}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Reseller státusz:</strong> ${escapeHtml(resellerStatus)}</td></tr>
      </table>
    `,
    ctaText: 'Partner oldal megnyitása',
    ctaUrl: partnerUrl
  });
}

export async function POST(request: Request) {
  console.info('[media-kit-email] Route called');

  const hasResendKey = Boolean(process.env.RESEND_API_KEY);
  const hasEmailFrom = Boolean(process.env.EMAIL_FROM);
  const hasAdminEmail = Boolean(process.env.ADMIN_NOTIFICATION_EMAIL);
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  console.info('[media-kit-email] Configuration diagnostics', {
    hasResendKey,
    hasEmailFrom,
    hasAdminEmail,
    hasSupabaseUrl,
    hasServiceRole
  });

  try {
    const body = (await request.json()) as MediaKitEmailRequest;

    const normalizedName = body.name?.trim() ?? '';
    const normalizedEmail = body.email?.trim().toLowerCase() ?? '';

    if (!normalizedName || !normalizedEmail) {
      return NextResponse.json(
        { ok: false, step: 'validation', message: 'name és email kötelező.', details: null },
        { status: 400 }
      );
    }

    const isDevelopment = process.env.NODE_ENV !== 'production';
    const senderEmail = resolveAquadropSenderEmail({ allowFallback: isDevelopment });

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'admin@aquadrop.hu';
    let isResellerLead = false;

    try {
      isResellerLead = await hasResellerApplication(normalizedEmail);
      console.info('[media-kit-email] Reseller check result', { resellerFound: isResellerLead });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected Supabase reseller lookup error';
      return NextResponse.json(
        {
          ok: false,
          step: 'reseller-check',
          message: 'A viszonteladói ellenőrzés nem sikerült.',
          details: message
        },
        { status: 500 }
      );
    }

    const adminPayload = {
      name: normalizedName,
      email: normalizedEmail,
      company: body.company?.trim() || null,
      usageType: body.usage_type?.trim() || null,
      downloadedFile: body.downloaded_file?.trim() || null,
      isResellerLead
    };

    let downloadEmailSent = false;
    let adminEmailSent = false;

    try {
      const downloadEmailResult = await sendEmailWithResend({
        from: senderEmail,
        to: normalizedEmail,
        subject: 'Aquadrop Media Kit anyagok',
        html: buildUserEmailHtml(normalizedName, isResellerLead),
        replyTo: REPLY_TO_EMAIL
      });
      downloadEmailSent = true;
      console.info('[media-kit-email] Resend send result', {
        emailType: 'download-email',
        success: true,
        resendId: downloadEmailResult.id ?? null
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected Resend error (download email)';
      console.error('[media-kit-email] Resend send result', {
        emailType: 'download-email',
        success: false,
        error: message
      });
      return NextResponse.json(
        {
          ok: false,
          step: 'send-download-email',
          message: 'A letöltési email küldése nem sikerült.',
          details: message
        },
        { status: 500 }
      );
    }

    try {
      const adminEmailResult = await sendEmailWithResend({
        from: senderEmail,
        to: adminEmail,
        subject: 'Új Media Kit letöltés',
        html: buildAdminEmailHtml(adminPayload),
        replyTo: REPLY_TO_EMAIL
      });
      adminEmailSent = true;
      console.info('[media-kit-email] Resend send result', {
        emailType: 'admin-email',
        success: true,
        resendId: adminEmailResult.id ?? null
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected Resend error (admin email)';
      console.error('[media-kit-email] Resend send result', {
        emailType: 'admin-email',
        success: false,
        error: message
      });
      return NextResponse.json(
        {
          ok: false,
          step: 'send-admin-email',
          message: 'Az admin értesítő email küldése nem sikerült.',
          details: message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      resellerFound: isResellerLead,
      downloadEmailSent,
      adminEmailSent
    });
  } catch (error) {
    console.error('[media-kit-email] Sending media kit notifications failed', error);
    return NextResponse.json(
      {
        ok: false,
        step: 'unexpected',
        message: 'Váratlan hiba történt a media kit email feldolgozás közben.',
        details: error instanceof Error ? error.message : 'Unexpected media kit notification error'
      },
      { status: 500 }
    );
  }
}
