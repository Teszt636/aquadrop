import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { archiveTemplate } from '@/lib/admin/b2b-email-store';

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await archiveTemplate(id);
    return NextResponse.json({ success: true, message: 'A sablon archiválva lett. A korábbi kampányok snapshotjai megmaradnak.' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'A sablon archiválása nem sikerült.' },
      { status: 500 }
    );
  }
}
