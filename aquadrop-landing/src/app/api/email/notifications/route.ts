import { NextResponse } from 'next/server';

import { sendFormNotifications } from '@/lib/email/notifications';
import { type EmailNotificationRequest } from '@/lib/email/types';

export async function POST(request: Request) {
  try {
    console.info('[email][api] /api/email/notifications route hit');

    const body = (await request.json()) as EmailNotificationRequest;
    const recipientEmail = body.payload?.email;

    console.info('[email][api] Request parsed', {
      type: body.type,
      payloadKeys: Object.keys(body.payload ?? {}),
      recipientEmail
    });

    await sendFormNotifications(body);

    console.info('[email][api] Notification flow finished successfully', {
      type: body.type,
      recipientEmail
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Email notification sending failed:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected notification error'
      },
      { status: 500 }
    );
  }
}
