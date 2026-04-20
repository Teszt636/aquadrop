const RESEND_API_URL = 'https://api.resend.com/emails';

export type SendEmailInput = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
};

function requireServerEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

export async function sendEmailWithResend(input: SendEmailInput): Promise<void> {
  const apiKey = requireServerEnv('RESEND_API_KEY');

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: input.from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(`Resend API request failed (${response.status}): ${responseText}`);
  }
}
