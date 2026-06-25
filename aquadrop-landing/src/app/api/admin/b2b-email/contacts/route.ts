import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { addContactsToGroups, createContact, listContacts } from '@/lib/admin/b2b-email-store';

export async function GET() {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const rows = await listContacts();
    return NextResponse.json({ rows });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Lekérdezési hiba.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const row = await createContact(body);
    await addContactsToGroups([row.id], body.groupIds);
    return NextResponse.json({ success: true, row });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Mentési hiba.' }, { status: 400 });
  }
}
