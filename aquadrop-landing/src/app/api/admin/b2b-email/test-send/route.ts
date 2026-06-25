import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { fetchTemplateById } from '@/lib/admin/b2b-email-store';
import { renderB2BTemplate, sanitizeEmailAddress } from '@/lib/email/b2b-campaigns';
import { sendEmailWithResend } from '@/lib/email/resend';

function getFromEmail(): string {
  const value = process.env.RESEND_FROM_EMAIL;
  if (!value) {
    throw new Error('Missing RESEND_FROM_EMAIL.');
  }
  return value;
}

export async function POST(request: Request) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      send?: boolean;
      template_id?: string;
      subject?: string;
      html?: string;
      text?: string;
      to?: string;
    };

    if (body.send !== true) {
      return NextResponse.json({ error: 'A tesztküldéshez send: true szükséges.' }, { status: 400 });
    }

    const to = sanitizeEmailAddress(body.to || sessionUser.email);
    const template = body.template_id ? await fetchTemplateById(body.template_id) : null;
    const subject = template?.subject || body.subject?.trim();
    const htmlBody = template?.html_body || body.html?.trim();

    if (!subject || !htmlBody) {
      return NextResponse.json({ error: 'A tesztküldéshez tárgy és HTML törzs szükséges.' }, { status: 400 });
    }

    const rendered = renderB2BTemplate({
      subject,
      htmlBody,
      textBody: template?.text_body || body.text,
      contact: {
        id: '00000000-0000-4000-8000-000000000000',
        company_name: 'Teszt cég',
        contact_name: sessionUser.name,
        email: to
      }
    });

    const response = await sendEmailWithResend({
      from: getFromEmail(),
      to,
      subject: rendered.subject,
      html: rendered.html
    });

    return NextResponse.json({ success: true, response });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Tesztküldési hiba.' }, { status: 500 });
  }
}
