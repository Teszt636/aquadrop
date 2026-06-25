import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import { fetchCampaignById, fetchContactById } from '@/lib/admin/b2b-email-store';
import { renderB2BTemplate } from '@/lib/email/b2b-campaigns';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  const { id } = await context.params;
  const campaign = await fetchCampaignById(id);
  if (!campaign || !campaign.subject_snapshot || !campaign.html_snapshot) {
    return NextResponse.json({ error: 'A kampány nem található vagy hiányos.' }, { status: 404 });
  }

  const contactId = new URL(request.url).searchParams.get('contactId');
  const contact = contactId ? await fetchContactById(contactId) : null;
  const rendered = renderB2BTemplate({
    subject: campaign.subject_snapshot,
    htmlBody: campaign.html_snapshot,
    textBody: campaign.text_snapshot,
    contact: contact ?? {
      id: '00000000-0000-4000-8000-000000000000',
      company_name: 'Minta Kft.',
      contact_name: 'Minta Partner',
      email: sessionUser.email
    }
  });

  return NextResponse.json(rendered);
}
