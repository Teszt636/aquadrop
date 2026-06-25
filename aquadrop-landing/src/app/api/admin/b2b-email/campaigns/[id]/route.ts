import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { archiveCampaign } from '@/lib/admin/b2b-email-store';

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const campaign = await archiveCampaign(id);
    return NextResponse.json({
      success: true,
      message:
        campaign && ['queued', 'sending'].includes(campaign.status)
          ? 'A kampány archiválva lett, a még el nem küldött címzettek skipped státuszba kerültek.'
          : 'A kampány archiválva lett. A küldési napló megmarad.'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'A kampány archiválása nem sikerült.' },
      { status: 500 }
    );
  }
}
