const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_BATCH_API_URL = 'https://api.resend.com/emails/batch';

export type SendEmailInput = {
  from: string;
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html: string;
  replyTo?: string | string[];
};

export type ResendSendResponse = {
  id?: string;
  [key: string]: unknown;
};

export type ResendEmailTag = {
  name: string;
  value: string;
};

export type SendBatchEmailItem = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | string[];
  tags?: ResendEmailTag[];
};

export type ResendBatchSendResponse = {
  data?: Array<{ id?: string; [key: string]: unknown }>;
  [key: string]: unknown;
};

function requireServerEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    console.error('[email][resend] Missing required environment variable', { name });
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

export async function sendEmailWithResend(input: SendEmailInput): Promise<ResendSendResponse> {
  const apiKey = requireServerEnv('RESEND_API_KEY');
  const recipientList = Array.isArray(input.to) ? input.to : [input.to];
  const ccList = input.cc ? (Array.isArray(input.cc) ? input.cc : [input.cc]) : undefined;

  console.info('[email][resend] Sending email request', {
    from: input.from,
    to: recipientList,
    cc: ccList,
    subject: input.subject
  });

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: input.from,
      to: recipientList,
      cc: ccList,
      subject: input.subject,
      html: input.html,
      reply_to: input.replyTo
    }),
    cache: 'no-store'
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('[email][resend] Resend API request failed', {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
      from: input.from,
      to: recipientList
    });

    throw new Error(`Resend API request failed (${response.status}): ${responseText}`);
  }

  let parsed: ResendSendResponse = {};

  if (responseText) {
    try {
      parsed = JSON.parse(responseText) as ResendSendResponse;
    } catch {
      parsed = { raw: responseText };
    }
  }

  console.info('[email][resend] Resend API request succeeded', {
    id: parsed.id,
    response: parsed
  });

  return parsed;
}

function assertValidBatchItems(items: SendBatchEmailItem[]): void {
  if (!Array.isArray(items) || items.length < 1 || items.length > 100) {
    throw new Error('A Resend batch mérete csak 1 és 100 között lehet.');
  }

  items.forEach((item, index) => {
    if (!item.from || !item.to || !item.subject || !item.html) {
      throw new Error(`Hiányos batch email elem: ${index + 1}.`);
    }

    if (item.to.includes(',') || item.to.includes(';')) {
      throw new Error('Egy batch email elem pontosan egy címzettet tartalmazhat.');
    }
  });
}

export async function sendBatchEmailsWithResend(items: SendBatchEmailItem[]): Promise<ResendBatchSendResponse> {
  assertValidBatchItems(items);

  const apiKey = requireServerEnv('RESEND_API_KEY');
  const payload = items.map((item) => ({
    from: item.from,
    to: [item.to],
    subject: item.subject,
    html: item.html,
    text: item.text,
    reply_to: item.replyTo,
    tags: item.tags
  }));

  console.info('[email][resend] Sending batch email request', {
    count: payload.length,
    subjects: [...new Set(payload.map((item) => item.subject))]
  });

  const response = await fetch(RESEND_BATCH_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    cache: 'no-store'
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('[email][resend] Resend batch API request failed', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

    throw new Error(`Resend batch API request failed (${response.status}): ${responseText}`);
  }

  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText) as ResendBatchSendResponse;
  } catch {
    return { raw: responseText };
  }
}
