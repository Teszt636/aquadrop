import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import {
  archiveContact,
  fetchContactById,
  listActiveGroups,
  listContactGroupIds,
  updateContactDetails
} from '@/lib/admin/b2b-email-store';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const contact = await fetchContactById(id);
    if (!contact || contact.deleted_at) {
      return NextResponse.json({ error: 'A címzett nem található.' }, { status: 404 });
    }

    const [contactGroupIds, activeGroups] = await Promise.all([listContactGroupIds(id), listActiveGroups()]);
    return NextResponse.json({ contact, contactGroupIds, activeGroups });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'A címzett lekérdezése nem sikerült.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const contact = await updateContactDetails(id, body);
    return NextResponse.json({ success: true, contact, message: 'Címzett adatai mentve.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'A címzett mentése nem sikerült.' }, { status: 400 });
  }
}

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
