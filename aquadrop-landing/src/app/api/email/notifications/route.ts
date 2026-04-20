import { NextResponse } from 'next/server';

import { sendFormNotifications } from '@/lib/email/notifications';
import { type EmailNotificationRequest } from '@/lib/email/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EmailNotificationRequest;

    await sendFormNotifications(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Email notification sending failed:', error);

    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
