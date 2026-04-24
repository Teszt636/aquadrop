import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

type MediaKitDownloadRecord = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  usage_type: string;
  downloaded_file: string | null;
  created_at: string;
};

type SupabaseWebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: MediaKitDownloadRecord;
};

type ResellerCheckRow = { id: string };

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL = Deno.env.get('MEDIA_KIT_FROM_EMAIL') ?? 'Aquadrop <noreply@aquadrop.hu>';
const ADMIN_EMAIL = Deno.env.get('MEDIA_KIT_ADMIN_EMAIL') ?? 'admin@aquadrop.hu';
const REPLY_TO_EMAIL = Deno.env.get('MEDIA_KIT_REPLY_TO_EMAIL') ?? 'hello@aquadrop.hu';
const RESELLER_APPLICATION_URL =
  Deno.env.get('MEDIA_KIT_RESELLER_APPLICATION_URL') ?? 'https://www.aquadrop.hu/partner#reseller-application-form';
const PUBLIC_DOWNLOAD_BASE_URL = Deno.env.get('MEDIA_KIT_DOWNLOAD_BASE_URL') ?? 'https://www.aquadrop.hu';

function escapeHtml(raw: string): string {
  return raw
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toDownloadLink(downloadedFile: string | null): string {
  if (!downloadedFile) {
    return `${PUBLIC_DOWNLOAD_BASE_URL}/partner`;
  }

  if (downloadedFile.startsWith('http://') || downloadedFile.startsWith('https://')) {
    return downloadedFile;
  }

  const normalizedBase = PUBLIC_DOWNLOAD_BASE_URL.endsWith('/')
    ? PUBLIC_DOWNLOAD_BASE_URL.slice(0, -1)
    : PUBLIC_DOWNLOAD_BASE_URL;

  const normalizedPath = downloadedFile.startsWith('/') ? downloadedFile : `/${downloadedFile}`;
  return `${normalizedBase}${normalizedPath}`;
}

function buildDownloaderEmail(record: MediaKitDownloadRecord, isReseller: boolean): SendEmailInput {
  const name = escapeHtml(record.name);
  const downloadLink = escapeHtml(toDownloadLink(record.downloaded_file));

  const nonResellerCta = isReseller
    ? ''
    : `
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
      <p style="margin:0 0 12px;">Szeretnél viszonteladó lenni?</p>
      <p style="margin:0 0 8px;">Egy rövid folyamat:</p>
      <ol style="margin:0 0 14px;padding-left:20px;">
        <li>űrlap kitöltése</li>
        <li>rövid egyeztetés</li>
        <li>indulhat az együttműködés</li>
      </ol>
      <p style="margin:0;">
        👉 <a href="${escapeHtml(RESELLER_APPLICATION_URL)}" target="_blank" rel="noreferrer">VISZONTELADÓI JELENTKEZÉS</a>
      </p>
    `;

  return {
    to: record.email,
    subject: 'Aquadrop anyagok + következő lépés',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
        <p>Kedves ${name},</p>
        <p>Köszönjük az érdeklődést!</p>
        <p>
          Innen le tudod tölteni az anyagokat:<br />
          👉 <a href="${downloadLink}" target="_blank" rel="noreferrer">LETÖLTÉS LINK</a>
        </p>
        <p>Néhány gyors tipp:<br />
        – A "20°C-on is hatékony" üzenet jól konvertál<br />
        – A before/after képek erősen növelik az eladást</p>
        ${nonResellerCta}
        <p style="margin-top:20px;">Üdv,<br />Aquadrop</p>
      </div>
    `
  };
}

function buildAdminEmail(record: MediaKitDownloadRecord, isReseller: boolean): SendEmailInput {
  const resellerStatus = isReseller
    ? '✔ Már jelentkezett viszonteladónak'
    : '❗ Még nem jelentkezett viszonteladónak';

  return {
    to: ADMIN_EMAIL,
    subject: 'Új Media Kit letöltés',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
        <p><strong>Új érdeklődő:</strong></p>
        <p>
          Név: ${escapeHtml(record.name)}<br />
          Email: ${escapeHtml(record.email)}<br />
          Cég: ${escapeHtml(record.company ?? '') || '-'}<br />
          Felhasználás: ${escapeHtml(record.usage_type)}
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
        <p><strong>Reseller státusz:</strong></p>
        <p>${resellerStatus}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
        <p><strong>Letöltött fájl:</strong><br />${escapeHtml(record.downloaded_file ?? '-')}</p>
      </div>
    `
  };
}

async function checkResellerStatus(email: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[media-kit-download-notifier] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
    return false;
  }

  const url = new URL(`${supabaseUrl}/rest/v1/reseller_applications`);
  url.searchParams.set('select', 'id');
  url.searchParams.set('email', `eq.${email}`);
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    }
  });

  if (!response.ok) {
    const responseBody = await response.text();
    console.error('[media-kit-download-notifier] reseller check failed', {
      status: response.status,
      responseBody
    });
    return false;
  }

  const rows = (await response.json()) as ResellerCheckRow[];
  return rows.length > 0;
}

async function sendWithResend(input: SendEmailInput): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is missing');
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html: input.html,
      reply_to: REPLY_TO_EMAIL
    })
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Resend API error (${response.status}): ${responseBody}`);
  }
}

serve(async (request) => {
  try {
    const payload = (await request.json()) as SupabaseWebhookPayload;
    const record = payload.record;

    if (!record?.email || !record?.name) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing record fields' }), { status: 400 });
    }

    const normalizedEmail = record.email.trim().toLowerCase();
    const normalizedRecord: MediaKitDownloadRecord = {
      ...record,
      email: normalizedEmail
    };

    const isReseller = await checkResellerStatus(normalizedEmail);

    const downloaderEmail = buildDownloaderEmail(normalizedRecord, isReseller);
    const adminEmail = buildAdminEmail(normalizedRecord, isReseller);

    const results = await Promise.allSettled([sendWithResend(downloaderEmail), sendWithResend(adminEmail)]);

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error('[media-kit-download-notifier] email sending failed', {
          recipient: index === 0 ? downloaderEmail.to : adminEmail.to,
          reason: result.reason
        });
      }
    });

    return new Response(JSON.stringify({ ok: true, is_reseller: isReseller }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[media-kit-download-notifier] unexpected error', error);

    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
