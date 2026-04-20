const RESEND_API_URL = 'https://api.resend.com/emails';

export type SendEmailInput = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
};

export type ResendSendResponse = {
  id?: string;
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

  console.info('[email][resend] Sending email request', {
    from: input.from,
    to: recipientList,
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
      subject: input.subject,
      html: input.html
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
