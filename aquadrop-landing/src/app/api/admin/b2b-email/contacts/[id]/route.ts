import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { archiveContact } from '@/lib/admin/b2b-email-store';

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await archiveContact(id);
    return NextResponse.json({ success: true, message: 'A címzett inaktiválva lett. A korábbi kampánynaplók megmaradnak.' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'A címzett inaktiválása nem sikerült.' },
      { status: 500 }
    );
  }
}
