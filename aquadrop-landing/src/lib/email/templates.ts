export type AnnouncementSignupEmailData = {
  name: string;
  email: string;
  phone: string | null;
  submittedAt: string;
};

export type GiftClaimEmailData = {
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  purchaseLocation: string;
  purchaseDate: string;
  receiptUrl: string | null;
  submittedAt: string;
};

export type ResellerApplicationEmailData = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string | null;
  salesChannel: string;
  message: string | null;
  submittedAt: string;
};

type EmailTemplate = {
  subject: string;
  html: string;
};

type BrandedEmailLayoutParams = {
  subject: string;
  headline: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
};

const SITE_URL_FALLBACK = 'https://www.aquadrop.hu';
const ADMIN_DASHBOARD_URL = 'https://www.aquadrop.hu/admin';
const ADMIN_CTA_TEXT = 'Admin felület megnyitása';

function getSiteUrl(): string {
  return process.env.SITE_URL?.replace(/\/$/, '') || SITE_URL_FALLBACK;
}

function formatOptional(value: string | null): string {
  return value && value.trim() ? value.trim() : 'Nincs megadva';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderBrandedEmailLayout(params: BrandedEmailLayoutParams): string {
  const ctaUrl = params.ctaUrl ?? getSiteUrl();
  const ctaBlock = params.ctaText
    ? `<tr>
        <td style="padding: 10px 28px 0; text-align: center;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td bgcolor="#2563eb" style="border-radius: 10px; text-align: center;">
                <a href="${escapeHtml(ctaUrl)}" target="_blank" style="display: inline-block; padding: 13px 24px; font-size: 15px; line-height: 1; font-weight: 700; color: #ffffff; text-decoration: none;">
                  ${escapeHtml(params.ctaText)}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : '';

  return `
    <!doctype html>
    <html lang="hu">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>${escapeHtml(params.subject)}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: Arial, Helvetica, sans-serif;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f6f9fc;">
          <tr>
            <td align="center" style="padding: 28px 12px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #dbeafe; border-radius: 18px;">
                <tr>
                  <td style="padding: 30px 28px 14px; text-align: center;">
                    <span style="display: inline-block; border-radius: 999px; padding: 7px 14px; background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700;">
                      AQUADROP EXPERT PRO
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 28px; text-align: center;">
                    <h1 style="margin: 0; color: #0f172a; font-size: 30px; line-height: 1.3; font-weight: 700;">
                      ${escapeHtml(params.headline)}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 28px 10px; color: #475569; font-size: 16px; line-height: 26px;">
                    ${params.bodyHtml}
                  </td>
                </tr>
                ${ctaBlock}
                <tr>
                  <td style="padding: 26px 28px 30px;">
                    <p style="margin: 0; font-size: 14px; line-height: 22px; color: #64748b; text-align: center;">
                      Üdvözlettel,<br />Aquadrop Ügyfélszolgálat
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildUserEmailTemplate(params: {
  subject: string;
  greetingName: string;
  title: string;
  paragraphs: string[];
  ctaText: string;
}): EmailTemplate {
  const bodyParagraphs = params.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin: 0 0 16px; font-size: 16px; line-height: 26px; color: #475569;">${escapeHtml(paragraph)}</p>`
    )
    .join('');

  const bodyHtml = `<p style="margin: 0 0 16px; font-size: 16px; line-height: 26px; color: #475569;">Szia ${escapeHtml(params.greetingName)}!</p>${bodyParagraphs}`;

  return {
    subject: params.subject,
    html: renderBrandedEmailLayout({
      subject: params.subject,
      headline: params.title,
      bodyHtml,
      ctaText: params.ctaText,
      ctaUrl: getSiteUrl()
    })
  };
}

function buildAdminEmailTemplate(params: {
  subject: string;
  headline: string;
  rows: Array<{ label: string; value: string }>;
  ctaText?: string;
  ctaUrl?: string;
}): EmailTemplate {
  const rowsHtml = params.rows
    .map(
      (row) =>
        `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong style="color: #0f172a;">${escapeHtml(row.label)}:</strong> <span style="color: #475569;">${escapeHtml(row.value)}</span></td></tr>`
    )
    .join('');

  const bodyHtml = `
    <p style="margin: 0 0 16px; color: #475569;">${escapeHtml(params.headline)}.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
      ${rowsHtml}
    </table>
  `;

  return {
    subject: params.subject,
    html: renderBrandedEmailLayout({
      subject: params.subject,
      headline: params.headline,
      bodyHtml,
      ctaText: params.ctaText,
      ctaUrl: params.ctaUrl
    })
  };
}

export function buildAnnouncementUserEmail(name: string): EmailTemplate {
  return buildUserEmailTemplate({
    subject: 'Sikeres feliratkozás',
    greetingName: name,
    title: 'Sikeres feliratkozás',
    paragraphs: [
      'Köszönjük, hogy feliratkoztál az Aquadrop értesítőre. Elsők között értesülsz az új termékekről, ajánlatokról és induló akciókról.'
    ],
    ctaText: 'Megnézem az Aquadrop Expert Prót'
  });
}

export function buildAnnouncementAlreadyExistsUserEmail(name: string): EmailTemplate {
  return buildUserEmailTemplate({
    subject: 'Már feliratkoztál',
    greetingName: name,
    title: 'Már feliratkoztál',
    paragraphs: [
      'Úgy látjuk, hogy ezzel az email címmel már korábban feliratkoztál. Hamarosan küldjük az újdonságokat és ajánlatokat.'
    ],
    ctaText: 'Megnézem az Aquadrop Expert Prót'
  });
}

export function buildAnnouncementAdminEmail(data: AnnouncementSignupEmailData): EmailTemplate {
  return buildAdminEmailTemplate({
    subject: 'Új feliratkozó',
    headline: 'Új feliratkozó',
    rows: [
      { label: 'Név', value: data.name },
      { label: 'Email', value: data.email },
      { label: 'Telefon', value: formatOptional(data.phone) },
      { label: 'Időpont', value: data.submittedAt }
    ],
    ctaText: ADMIN_CTA_TEXT,
    ctaUrl: ADMIN_DASHBOARD_URL
  });
}

export function buildGiftUserEmail(name: string): EmailTemplate {
  return buildUserEmailTemplate({
    subject: 'Megkaptuk az ajándékigénylésed',
    greetingName: name,
    title: 'Megkaptuk az ajándékigénylésed',
    paragraphs: [
      'Köszönjük, hogy igényelted az Aquadrop ajándék mosókapszulát. Az igénylésed rendben megérkezett, jelenleg feldolgozás alatt van.'
    ],
    ctaText: 'Megnézem az Aquadrop Expert Prót'
  });
}

export function buildGiftAlreadyExistsUserEmail(name: string): EmailTemplate {
  return buildUserEmailTemplate({
    subject: 'Ajándék – már igényelted',
    greetingName: name,
    title: 'Ajándék – már igényelted',
    paragraphs: [
      'Úgy látjuk, hogy ezzel az email címmel már korábban igényeltél Aquadrop ajándék csomagot. Az akció keretében egy felhasználó egy alkalommal jogosult az ajándékra.'
    ],
    ctaText: 'Megnézem az Aquadrop Expert Prót'
  });
}

export function buildGiftAdminEmail(data: GiftClaimEmailData): EmailTemplate {
  return buildAdminEmailTemplate({
    subject: 'Új ajándékigénylés',
    headline: 'Új ajándékigénylés',
    rows: [
      { label: 'Név', value: data.fullName },
      { label: 'Email', value: data.email },
      { label: 'Telefon', value: data.phone },
      { label: 'Szállítási cím', value: data.shippingAddress },
      { label: 'Vásárlás helye', value: data.purchaseLocation },
      { label: 'Vásárlás dátuma', value: data.purchaseDate },
      { label: 'Receipt URL', value: formatOptional(data.receiptUrl) },
      { label: 'Időpont', value: data.submittedAt }
    ],
    ctaText: ADMIN_CTA_TEXT,
    ctaUrl: ADMIN_DASHBOARD_URL
  });
}

export function buildResellerUserEmail(name: string): EmailTemplate {
  return buildUserEmailTemplate({
    subject: 'Köszönjük a viszonteladói jelentkezésed',
    greetingName: name,
    title: 'Köszönjük a viszonteladói jelentkezésed',
    paragraphs: [
      'Köszönjük, hogy érdeklődsz az Aquadrop Expert Pro viszonteladói lehetőség iránt. A jelentkezésed megérkezett, hamarosan felvesszük veled a kapcsolatot a részletekkel.'
    ],
    ctaText: 'Viszonteladói oldal megnyitása'
  });
}

export function buildResellerAlreadyExistsUserEmail(name: string): EmailTemplate {
  return buildUserEmailTemplate({
    subject: 'Már jelentkeztél viszonteladónak',
    greetingName: name,
    title: 'Már jelentkeztél viszonteladónak',
    paragraphs: [
      'Ezzel az email címmel már érkezett viszonteladói jelentkezés. Dolgozunk rajta, és hamarosan jelentkezünk a részletekkel.'
    ],
    ctaText: 'Viszonteladói oldal megnyitása'
  });
}

export function buildResellerAdminEmail(data: ResellerApplicationEmailData): EmailTemplate {
  return buildAdminEmailTemplate({
    subject: 'Új viszonteladó jelentkezett',
    headline: 'Új viszonteladó jelentkezett',
    rows: [
      { label: 'Cégnév', value: data.companyName },
      { label: 'Kapcsolattartó', value: data.contactName },
      { label: 'Email', value: data.email },
      { label: 'Telefon', value: data.phone },
      { label: 'Weboldal', value: formatOptional(data.website) },
      { label: 'Értékesítési csatorna', value: data.salesChannel },
      { label: 'Üzenet', value: formatOptional(data.message) },
      { label: 'Időpont', value: data.submittedAt }
    ],
    ctaText: ADMIN_CTA_TEXT,
    ctaUrl: ADMIN_DASHBOARD_URL
  });
}

export type PartnerTaskLeadItem = {
  companyName: string;
  contactName: string;
  nextActionAt: string | null;
  nextActionDescription: string | null;
  leadScore: number | null;
  pipelineStatus: string | null;
};

const PARTNER_ADMIN_URL = 'https://www.aquadrop.hu/admin?tab=reseller_applications';

function formatPartnerDate(value: string | null): string {
  if (!value) {
    return 'Nincs határidő';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('hu-HU', {
    timeZone: 'Europe/Budapest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsed);
}

function renderPartnerLeadList(
  title: string,
  leads: PartnerTaskLeadItem[],
  rowMapper: (lead: PartnerTaskLeadItem) => string
): string {
  if (leads.length === 0) {
    return '';
  }

  const rows = leads
    .map((lead) => {
      return `<li style="margin: 0 0 10px; color: #1e293b;">${rowMapper(lead)}</li>`;
    })
    .join('');

  return `
    <h2 style="margin: 18px 0 10px; color: #0f172a; font-size: 19px;">${escapeHtml(title)}</h2>
    <ul style="margin: 0; padding: 0 0 0 18px; color: #1e293b;">
      ${rows}
    </ul>
  `;
}

export function buildPartnerDailyTasksEmail(params: {
  overdueLeads: PartnerTaskLeadItem[];
  todayLeads: PartnerTaskLeadItem[];
  hotLeads: PartnerTaskLeadItem[];
}): EmailTemplate {
  const subject = '🔥 Mai teendőid – Aquadrop CRM Partner';

  const summaryHtml = `
    <p style="margin: 0 0 8px;"><strong>${params.overdueLeads.length}</strong> lead lejárt határidővel</p>
    <p style="margin: 0 0 8px;"><strong>${params.todayLeads.length}</strong> mai teendő</p>
    <p style="margin: 0 0 8px;"><strong>${params.hotLeads.length}</strong> hot lead</p>
  `;

  const overdueHtml = renderPartnerLeadList('Lejárt határidők', params.overdueLeads, (lead) => {
    return `<strong>${escapeHtml(lead.companyName)}</strong> · ${escapeHtml(lead.contactName)} · Határidő: ${escapeHtml(formatPartnerDate(lead.nextActionAt))} · Teendő: ${escapeHtml(formatOptional(lead.nextActionDescription))}`;
  });

  const todayHtml = renderPartnerLeadList('Mai teendők', params.todayLeads, (lead) => {
    return `<strong>${escapeHtml(lead.companyName)}</strong> · ${escapeHtml(lead.contactName)} · Határidő: ${escapeHtml(formatPartnerDate(lead.nextActionAt))} · Teendő: ${escapeHtml(formatOptional(lead.nextActionDescription))}`;
  });

  const hotHtml = renderPartnerLeadList('Hot leadek', params.hotLeads, (lead) => {
    const leadScore = typeof lead.leadScore === 'number' ? String(lead.leadScore) : 'N/A';
    return `<strong>${escapeHtml(lead.companyName)}</strong> · ${escapeHtml(lead.contactName)} · Lead score: ${escapeHtml(leadScore)} · Státusz: ${escapeHtml(formatOptional(lead.pipelineStatus))}`;
  });

  return {
    subject,
    html: renderBrandedEmailLayout({
      subject,
      headline: 'Mai partner CRM teendőid',
      bodyHtml: `${summaryHtml}${overdueHtml}${todayHtml}${hotHtml}`,
      ctaText: 'Admin megnyitása',
      ctaUrl: PARTNER_ADMIN_URL
    })
  };
}

export function buildPartnerOneHourReminderEmail(lead: PartnerTaskLeadItem): EmailTemplate {
  const subject = '🔥 Teendőd határideje 1 óra múlva lejár – Aquadrop CRM Partner';

  const bodyHtml = `
    <p style="margin: 0 0 12px; color: #475569;">Közeledik egy viszonteladói CRM teendő határideje:</p>
    <p style="margin: 0 0 8px;"><strong>Cégnév:</strong> ${escapeHtml(lead.companyName)}</p>
    <p style="margin: 0 0 8px;"><strong>Kapcsolattartó:</strong> ${escapeHtml(lead.contactName)}</p>
    <p style="margin: 0 0 8px;"><strong>Határidő:</strong> ${escapeHtml(formatPartnerDate(lead.nextActionAt))}</p>
    <p style="margin: 0;"><strong>Teendő:</strong> ${escapeHtml(formatOptional(lead.nextActionDescription))}</p>
  `;

  return {
    subject,
    html: renderBrandedEmailLayout({
      subject,
      headline: '1 órán belül lejáró teendő',
      bodyHtml,
      ctaText: 'Admin megnyitása',
      ctaUrl: PARTNER_ADMIN_URL
    })
  };
}
