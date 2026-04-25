import { NextResponse } from 'next/server';

import { sendEmailWithResend } from '@/lib/email/resend';

type MediaKitEmailRequest = {
  name?: string;
  email?: string;
  company?: string | null;
  usage_type?: string | null;
  downloaded_file?: string | null;
};

const REPLY_TO_EMAIL = 'hello@aquadrop.hu';
const DEV_SENDER_EMAIL_FALLBACK = 'Aquadrop Ügyfélszolgálat <noreply@aquadrop.hu>';

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

function toDownloadUrl(downloadedFile: string | null | undefined): string {
  if (!downloadedFile) {
    return '';
  }

  if (downloadedFile.startsWith('http://') || downloadedFile.startsWith('https://')) {
    return downloadedFile;
  }

  const siteUrl = process.env.SITE_URL?.replace(/\/$/, '');
  const filePath = downloadedFile.startsWith('/') ? downloadedFile : `/${downloadedFile}`;

  if (!siteUrl) {
    return filePath;
  }

  return `${siteUrl}${filePath}`;
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

function buildUserEmailHtml(name: string, downloadUrl: string, isResellerLead: boolean): string {
  const ctaBlock = isResellerLead
    ? '<p>Már látjuk a partneri érdeklődésedet, hamarosan felvesszük veled a kapcsolatot.</p>'
    : '<p>Ha még nem jelentkeztél viszonteladónak, itt tudod elindítani: <a href="https://www.aquadrop.hu/partner">https://www.aquadrop.hu/partner</a></p><p>A folyamat rövid:</p><ol><li>űrlap kitöltése</li><li>rövid egyeztetés</li><li>partneri feltételek átbeszélése</li><li>indulhat az együttműködés</li></ol>';

  return `<div>
    <p>Szia ${escapeHtml(name)},</p>
    <p>Köszönjük az érdeklődést!</p>
    <p>Innen le tudod tölteni az Aquadrop Expert Pro anyagokat:<br /><a href="${escapeHtml(downloadUrl)}">${escapeHtml(downloadUrl)}</a></p>
    <p>Néhány gyors tipp:</p>
    <ul>
      <li>A “20°C-on is hatékony” üzenet jól használható webshopos és közösségi kommunikációban.</li>
      <li>A látványos termékképek és előnyöket bemutató kreatívok segíthetnek gyorsabban bemutatni a terméket.</li>
    </ul>
    ${ctaBlock}
    <p>Üdv,<br />Aquadrop</p>
  </div>`;
}

function buildAdminEmailHtml(payload: {
  name: string;
  email: string;
  company: string | null;
  usageType: string | null;
  downloadedFile: string | null;
  isResellerLead: boolean;
}): string {
  const resellerStatus = payload.isResellerLead
    ? 'Már jelentkezett viszonteladónak'
    : 'Még nem jelentkezett viszonteladónak';

  return `<div>
    <p>Új Media Kit letöltés történt.</p>
    <p>Név: ${escapeHtml(payload.name)}<br />
    Email: ${escapeHtml(payload.email)}<br />
    Cég: ${escapeHtml(payload.company ?? '-')}<br />
    Felhasználás célja: ${escapeHtml(payload.usageType ?? '-')}<br />
    Letöltött fájl: ${escapeHtml(payload.downloadedFile ?? '-')}</p>
    <p>Reseller státusz:<br />${escapeHtml(resellerStatus)}</p>
  </div>`;
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
    const senderEmail = process.env.EMAIL_FROM || (isDevelopment ? DEV_SENDER_EMAIL_FALLBACK : '');

    if (!senderEmail) {
      return NextResponse.json(
        {
          ok: false,
          step: 'email-config',
          message: 'Hiányzó EMAIL_FROM környezeti változó.',
          details: 'Production környezetben kötelező az EMAIL_FROM beállítása.'
        },
        { status: 500 }
      );
    }

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

    const downloadUrl = toDownloadUrl(body.downloaded_file);
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
        subject: 'Aquadrop anyagok + következő lépés',
        html: buildUserEmailHtml(normalizedName, downloadUrl, isResellerLead),
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
