import { createHmac, timingSafeEqual } from 'node:crypto';

export type B2BTemplateContact = {
  id?: string | null;
  company_name?: string | null;
  contact_name?: string | null;
  email?: string | null;
};

export type RenderB2BTemplateInput = {
  subject: string;
  htmlBody: string;
  textBody?: string | null;
  contact: B2BTemplateContact;
};

export type RenderedB2BTemplate = {
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
};

const UNSUBSCRIBE_BLOCK =
  'Ha a beszerzési együttműködési megkeresés nem releváns Önnek, itt jelezheti, hogy a továbbiakban ne keressük: {{unsubscribe_url}}';

function getSiteUrl(): string {
  return (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aquadrop.hu').replace(/\/$/, '');
}

function getUnsubscribeSecret(): string {
  return process.env.B2B_UNSUBSCRIBE_SECRET || process.env.ADMIN_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function signContactId(contactId: string): string {
  const secret = getUnsubscribeSecret();
  if (!secret) {
    throw new Error('Missing unsubscribe signing secret.');
  }

  return createHmac('sha256', secret).update(contactId).digest('hex');
}

export function verifyUnsubscribeSignature(contactId: string, signature: string): boolean {
  if (!contactId || !signature) return false;
  const expected = signContactId(contactId);
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function buildUnsubscribeUrl(contactId?: string | null): string {
  if (!contactId) {
    return `${getSiteUrl()}/leiratkozas`;
  }

  const signature = signContactId(contactId);
  const params = new URLSearchParams({ contact: contactId, sig: signature });
  return `${getSiteUrl()}/leiratkozas?${params.toString()}`;
}

export function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function sanitizeEmailAddress(value: unknown): string {
  const normalized = normalizeEmail(value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('Érvénytelen email cím.');
  }
  return normalized;
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  if (size < 1) {
    throw new Error('A darabolási méret legalább 1 kell legyen.');
  }

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function replaceVariables(input: string, contact: B2BTemplateContact, unsubscribeUrl: string): string {
  const values: Record<string, string> = {
    company_name: contact.company_name?.trim() || '',
    contact_name: contact.contact_name?.trim() || contact.company_name?.trim() || 'Partnerünk',
    email: contact.email?.trim() || '',
    unsubscribe_url: unsubscribeUrl
  };

  return input.replace(/\{\{\s*(company_name|contact_name|email|unsubscribe_url)\s*\}\}/g, (_, key: string) => {
    return values[key] ?? '';
  });
}

function stripHtml(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function buildPlainTextFallback(html: string): string {
  return stripHtml(html);
}

function appendHtmlUnsubscribeBlock(html: string): string {
  if (html.includes(UNSUBSCRIBE_BLOCK) || html.includes('{{unsubscribe_url}}')) {
    return html;
  }

  return `${html}\n<hr><p style="font-size:12px;color:#475569;line-height:1.5">${UNSUBSCRIBE_BLOCK}</p>`;
}

function appendTextUnsubscribeBlock(text: string): string {
  if (text.includes(UNSUBSCRIBE_BLOCK) || text.includes('{{unsubscribe_url}}')) {
    return text;
  }

  return `${text.trim()}\n\n${UNSUBSCRIBE_BLOCK}`;
}

export function renderB2BTemplate(input: RenderB2BTemplateInput): RenderedB2BTemplate {
  const unsubscribeUrl = buildUnsubscribeUrl(input.contact.id);
  const subject = replaceVariables(input.subject, input.contact, unsubscribeUrl).trim();
  const htmlTemplate = appendHtmlUnsubscribeBlock(input.htmlBody);
  const html = replaceVariables(htmlTemplate, input.contact, unsubscribeUrl);
  const textTemplate = appendTextUnsubscribeBlock(input.textBody?.trim() || buildPlainTextFallback(input.htmlBody));
  const text = replaceVariables(textTemplate, input.contact, unsubscribeUrl);

  return {
    subject,
    html,
    text,
    unsubscribeUrl
  };
}
