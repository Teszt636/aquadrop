import { NextResponse } from 'next/server';

import { sendEmailWithResend } from '@/lib/email/resend';

type MediaKitEmailRequest = {
  name?: string;
  email?: string;
  company?: string | null;
  usage_type?: string | null;
  downloaded_file?: string | null;
};

const SENDER_EMAIL = 'Aquadrop Ügyfélszolgálat <noreply@aquadrop.hu>';
const REPLY_TO_EMAIL = 'hello@aquadrop.hu';

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

  const siteUrl = requireServerEnv('SITE_URL').replace(/\/$/, '');
  const filePath = downloadedFile.startsWith('/') ? downloadedFile : `/${downloadedFile}`;

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
  try {
    const body = (await request.json()) as MediaKitEmailRequest;

    const normalizedName = body.name?.trim() ?? '';
    const normalizedEmail = body.email?.trim().toLowerCase() ?? '';

    if (!normalizedName || !normalizedEmail) {
      return NextResponse.json(
        { ok: false, error: 'name és email kötelező.' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@aquadrop.hu';
    const isResellerLead = await hasResellerApplication(normalizedEmail);
    const downloadUrl = toDownloadUrl(body.downloaded_file);

    await Promise.all([
      sendEmailWithResend({
        from: SENDER_EMAIL,
        to: normalizedEmail,
        subject: 'Aquadrop anyagok + következő lépés',
        html: buildUserEmailHtml(normalizedName, downloadUrl, isResellerLead),
        replyTo: REPLY_TO_EMAIL
      }),
      sendEmailWithResend({
        from: SENDER_EMAIL,
        to: adminEmail,
        subject: 'Új Media Kit letöltés',
        html: buildAdminEmailHtml({
          name: normalizedName,
          email: normalizedEmail,
          company: body.company?.trim() || null,
          usageType: body.usage_type?.trim() || null,
          downloadedFile: body.downloaded_file?.trim() || null,
          isResellerLead
        }),
        replyTo: REPLY_TO_EMAIL
      })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[media-kit-email] Sending media kit notifications failed', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected media kit notification error'
      },
      { status: 500 }
    );
  }
}
