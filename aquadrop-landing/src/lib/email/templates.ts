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

function formatOptional(value: string | null): string {
  return value && value.trim() ? value.trim() : 'Nincs megadva';
}

function wrapHtml(content: string): string {
  return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">${content}</div>`;
}

function buildUserEmailTemplate(params: {
  subject: string;
  greetingName: string;
  title: string;
  paragraphs: string[];
}): EmailTemplate {
  const bodyParagraphs = params.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin: 0 0 16px; font-size: 16px; line-height: 26px; color: #334155;">${paragraph}</p>`
    )
    .join('');

  return {
    subject: params.subject,
    html: `
      <!doctype html>
      <html lang="hu">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="x-apple-disable-message-reformatting" />
          <title>${params.subject}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, Helvetica, sans-serif;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc;">
            <tr>
              <td align="center" style="padding: 28px 12px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px;">
                  <tr>
                    <td style="padding: 30px 28px 14px; text-align: center;">
                      <span style="display: inline-block; border-radius: 999px; padding: 7px 14px; background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700;">
                        Aquadrop Expert Pro
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 28px; text-align: center;">
                      <h1 style="margin: 0; color: #0f172a; font-size: 30px; line-height: 1.3; font-weight: 700;">
                        ${params.title}
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 28px 10px;">
                      <p style="margin: 0 0 16px; font-size: 16px; line-height: 26px; color: #334155;">Szia ${params.greetingName}!</p>
                      ${bodyParagraphs}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 28px 0; text-align: center;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                        <tr>
                          <td bgcolor="#2563eb" style="border-radius: 10px; text-align: center;">
                            <a href="https://aquadrop.hu" target="_blank" style="display: inline-block; padding: 13px 24px; font-size: 15px; line-height: 1; font-weight: 700; color: #ffffff; text-decoration: none;">
                              Vissza a főoldalra
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
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
    `
  };
}

export function buildAnnouncementUserEmail(name: string): EmailTemplate {
  return buildUserEmailTemplate({
    subject: 'Sikeres feliratkozás – elsők között értesítünk',
    greetingName: name,
    title: 'Sikeres feliratkozás',
    paragraphs: [
      'Köszönjük, hogy feliratkoztál az Aquadrop nagy bejelentésére.',
      'Hamarosan az elsők között küldjük az újdonságokat és ajánlatokat.'
    ]
  });
}

export function buildAnnouncementAdminEmail(data: AnnouncementSignupEmailData): EmailTemplate {
  return {
    subject: 'Új feliratkozó',
    html: wrapHtml(`
      <h2>Új feliratkozó</h2>
      <p><strong>Név:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telefon:</strong> ${formatOptional(data.phone)}</p>
      <p><strong>Időpont:</strong> ${data.submittedAt}</p>
    `)
  };
}

export function buildGiftUserEmail(name: string): EmailTemplate {
  return buildUserEmailTemplate({
    subject: 'Megkaptuk az ajándék igénylésed',
    greetingName: name,
    title: 'Megkaptuk az igénylésed',
    paragraphs: [
      'Megkaptuk az ajándék igénylésedet.',
      'Az igénylést feldolgozzuk, és hamarosan jelentkezünk a részletekkel.'
    ]
  });
}

export function buildGiftAdminEmail(data: GiftClaimEmailData): EmailTemplate {
  return {
    subject: 'Új ajándékigénylés',
    html: wrapHtml(`
      <h2>Új ajándékigénylés</h2>
      <p><strong>Név:</strong> ${data.fullName}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telefon:</strong> ${data.phone}</p>
      <p><strong>Szállítási cím:</strong> ${data.shippingAddress}</p>
      <p><strong>Vásárlás helye:</strong> ${data.purchaseLocation}</p>
      <p><strong>Vásárlás dátuma:</strong> ${data.purchaseDate}</p>
      <p><strong>Receipt URL:</strong> ${formatOptional(data.receiptUrl)}</p>
      <p><strong>Időpont:</strong> ${data.submittedAt}</p>
    `)
  };
}

export function buildResellerUserEmail(name: string): EmailTemplate {
  return buildUserEmailTemplate({
    subject: 'Köszönjük partner jelentkezésed',
    greetingName: name,
    title: 'Köszönjük a jelentkezésed',
    paragraphs: [
      'Köszönjük a partner jelentkezésedet.',
      'Hamarosan felvesszük veled a kapcsolatot a következő lépésekkel.'
    ]
  });
}

export function buildResellerAdminEmail(data: ResellerApplicationEmailData): EmailTemplate {
  return {
    subject: 'Új viszonteladó jelentkezett',
    html: wrapHtml(`
      <h2>Új viszonteladó jelentkezett</h2>
      <p><strong>Cégnév:</strong> ${data.companyName}</p>
      <p><strong>Kapcsolattartó:</strong> ${data.contactName}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telefon:</strong> ${data.phone}</p>
      <p><strong>Weboldal:</strong> ${formatOptional(data.website)}</p>
      <p><strong>Értékesítési csatorna:</strong> ${data.salesChannel}</p>
      <p><strong>Üzenet:</strong> ${formatOptional(data.message)}</p>
      <p><strong>Időpont:</strong> ${data.submittedAt}</p>
    `)
  };
}
