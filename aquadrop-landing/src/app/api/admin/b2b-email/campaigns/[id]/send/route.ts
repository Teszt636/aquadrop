import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import {
  fetchCampaignById,
  fetchContactById,
  isSuppressedContact,
  listPendingCampaignRecipients,
  patchCampaign,
  patchCampaignRecipient,
  updateCampaignAggregates
} from '@/lib/admin/b2b-email-store';
import { renderB2BTemplate } from '@/lib/email/b2b-campaigns';
import { sendBatchEmailsWithResend, type SendBatchEmailItem } from '@/lib/email/resend';

function getFromEmail(): string {
  const value = process.env.RESEND_FROM_EMAIL;
  if (!value) {
    throw new Error('Missing RESEND_FROM_EMAIL.');
  }
  return value;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  const body = (await request.json()) as { confirmSend?: boolean };
  if (body.confirmSend !== true) {
    return NextResponse.json({ error: 'A végleges küldéshez confirmSend: true szükséges.' }, { status: 400 });
  }

  const { id } = await context.params;
  const campaign = await fetchCampaignById(id);
  if (!campaign) {
    return NextResponse.json({ error: 'A kampány nem található.' }, { status: 404 });
  }

  const subject = campaign.subject_snapshot;
  const htmlBody = campaign.html_snapshot;
  if (!subject || !htmlBody) {
    return NextResponse.json({ error: 'A kampány snapshotja hiányos.' }, { status: 400 });
  }

  await patchCampaign(campaign.id, { status: 'sending' });
  const pendingRecipients = await listPendingCampaignRecipients(campaign.id);
  const sendable: Array<{ recipientId: string; item: SendBatchEmailItem }> = [];
  const skipped: string[] = [];

  for (const recipient of pendingRecipients) {
    const contact = recipient.contact_id ? await fetchContactById(recipient.contact_id) : null;
    if (!contact || isSuppressedContact(contact)) {
      skipped.push(recipient.id);
      await patchCampaignRecipient(recipient.id, {
        status: contact?.suppressed_at ? 'suppressed' : 'skipped',
        last_event_type: 'skipped',
        last_event_at: new Date().toISOString()
      });
      continue;
    }

    const rendered = renderB2BTemplate({
      subject,
      htmlBody,
      textBody: campaign.text_snapshot,
      contact
    });

    sendable.push({
      recipientId: recipient.id,
      item: {
        from: getFromEmail(),
        to: recipient.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        tags: [
          { name: 'campaign_id', value: campaign.id },
          { name: 'campaign_recipient_id', value: recipient.id },
          { name: 'source', value: 'aquadrop_b2b' }
        ]
      }
    });
  }

  if (sendable.length > 100) {
    await patchCampaign(campaign.id, { status: 'ready' });
    return NextResponse.json({ error: 'Egy kampány legfeljebb 100 aktív címzettnek küldhető ki.' }, { status: 400 });
  }

  if (sendable.length === 0) {
    await updateCampaignAggregates(campaign.id);
    await patchCampaign(campaign.id, { status: skipped.length > 0 ? 'failed' : 'ready' });
    return NextResponse.json({ success: false, error: 'Nincs küldhető aktív címzett.', skippedCount: skipped.length }, { status: 400 });
  }

  try {
    const response = await sendBatchEmailsWithResend(sendable.map((entry) => entry.item));
    const data = response.data ?? [];
    const now = new Date().toISOString();

    for (const [index, entry] of sendable.entries()) {
      const resendEmailId = data[index]?.id ?? null;
      await patchCampaignRecipient(entry.recipientId, {
        status: resendEmailId ? 'sent' : 'failed',
        resend_email_id: resendEmailId,
        resend_error: resendEmailId ? null : 'Missing Resend email id in batch response.',
        last_event_type: 'email.sent',
        last_event_at: now,
        sent_at: resendEmailId ? now : null,
        failed_at: resendEmailId ? null : now
      });
    }

    await updateCampaignAggregates(campaign.id);
    await patchCampaign(campaign.id, { status: data.length === sendable.length ? 'sent' : 'partial_failed', sent_at: now });
    return NextResponse.json({ success: true, sentCount: sendable.length, skippedCount: skipped.length });
  } catch (error) {
    const now = new Date().toISOString();
    for (const entry of sendable) {
      await patchCampaignRecipient(entry.recipientId, {
        status: 'failed',
        resend_error: error instanceof Error ? error.message : 'Resend küldési hiba.',
        failed_at: now,
        last_event_type: 'email.failed',
        last_event_at: now
      });
    }
    await updateCampaignAggregates(campaign.id);
    await patchCampaign(campaign.id, { status: 'failed' });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Resend küldési hiba.' }, { status: 500 });
  }
}
