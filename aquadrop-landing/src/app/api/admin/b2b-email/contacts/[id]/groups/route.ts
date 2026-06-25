import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { listActiveGroups, syncContactGroupMembership } from '@/lib/admin/b2b-email-store';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { groupIds?: unknown };
    const contactGroupIds = await syncContactGroupMembership(id, body.groupIds);
    const activeGroups = await listActiveGroups();
    return NextResponse.json({
      success: true,
      contactGroupIds,
      activeGroups,
      message: 'Célcsoportok mentve.'
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'A célcsoport-tagság mentése nem sikerült.' }, { status: 400 });
  }
}
