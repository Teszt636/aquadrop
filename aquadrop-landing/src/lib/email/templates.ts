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

export function buildAnnouncementUserEmail(name: string): EmailTemplate {
  return {
    subject: 'Sikeres feliratkozás – elsők között értesítünk',
    html: wrapHtml(`
      <p>Szia ${name}!</p>
      <p>Köszönjük, hogy feliratkoztál az Aquadrop nagy bejelentésére.</p>
      <p>Hamarosan az elsők között küldjük az újdonságokat és ajánlatokat.</p>
      <p>Üdv,<br />Aquadrop csapat</p>
    `)
  };
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
  return {
    subject: 'Megkaptuk az ajándék igénylésed',
    html: wrapHtml(`
      <p>Szia ${name}!</p>
      <p>Megkaptuk az ajándék igénylésedet.</p>
      <p>Az igénylést feldolgozzuk, és hamarosan jelentkezünk a részletekkel.</p>
      <p>Üdv,<br />Aquadrop csapat</p>
    `)
  };
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
  return {
    subject: 'Köszönjük partner jelentkezésed',
    html: wrapHtml(`
      <p>Szia ${name}!</p>
      <p>Köszönjük a partner jelentkezésedet.</p>
      <p>Hamarosan felvesszük veled a kapcsolatot a következő lépésekkel.</p>
      <p>Üdv,<br />Aquadrop csapat</p>
    `)
  };
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
