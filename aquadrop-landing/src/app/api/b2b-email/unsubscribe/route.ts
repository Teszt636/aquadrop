import { NextResponse } from 'next/server';

import { patchContact } from '@/lib/admin/b2b-email-store';
import { verifyUnsubscribeSignature } from '@/lib/email/b2b-campaigns';

export async function POST(request: Request) {
  const body = (await request.json()) as { contact?: string; sig?: string };
  const contactId = body.contact?.trim() ?? '';
  const signature = body.sig?.trim() ?? '';

  if (!verifyUnsubscribeSignature(contactId, signature)) {
    return NextResponse.json({ error: 'Érvénytelen leiratkozási hivatkozás.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  await patchContact(contactId, {
    unsubscribed_at: now,
    is_active: false,
    last_email_status: 'unsubscribed',
    last_email_event_at: now
  });

  return NextResponse.json({ success: true });
}
