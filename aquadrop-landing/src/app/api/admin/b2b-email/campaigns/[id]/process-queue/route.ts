import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import {
  fetchCampaignById,
  fetchContactById,
  finishCampaignIfQueueDrained,
  isSuppressedContact,
  listDueQueuedCampaignRecipients,
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

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const campaign = await fetchCampaignById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'A kampány nem található.' }, { status: 404 });
    }

    if (!campaign.subject_snapshot || !campaign.html_snapshot) {
      return NextResponse.json({ error: 'A kampány snapshotja hiányos.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const limit = Math.min(100, Math.max(1, campaign.max_emails_per_process ?? 10));
    const dueRecipients = await listDueQueuedCampaignRecipients(campaign.id, now, limit);
    const sendable: Array<{ recipientId: string; attemptCount: number; item: SendBatchEmailItem }> = [];
    const skipped: string[] = [];
    const processorId = `admin:${sessionUser.email}`;

    for (const recipient of dueRecipients) {
      const contact = recipient.contact_id ? await fetchContactById(recipient.contact_id) : null;
      if (!contact || isSuppressedContact(contact)) {
        skipped.push(recipient.id);
        await patchCampaignRecipient(recipient.id, {
          status: contact?.suppressed_at ? 'suppressed' : 'skipped',
          attempt_count: recipient.attempt_count + 1,
          last_event_type: 'skipped',
          last_event_at: now,
          locked_at: null,
          locked_by: null
        });
        continue;
      }

      const attemptCount = recipient.attempt_count + 1;
      await patchCampaignRecipient(recipient.id, {
        status: 'processing',
        processing_started_at: now,
        attempt_count: attemptCount,
        locked_at: now,
        locked_by: processorId,
        last_event_type: 'processing',
        last_event_at: now
      });

      const rendered = renderB2BTemplate({
        subject: campaign.subject_snapshot,
        htmlBody: campaign.html_snapshot,
        textBody: campaign.text_snapshot,
        contact
      });

      sendable.push({
        recipientId: recipient.id,
        attemptCount,
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

    if (sendable.length === 0) {
      await updateCampaignAggregates(campaign.id);
      await finishCampaignIfQueueDrained(campaign.id);
      return NextResponse.json({ success: true, processed_count: 0, sent_count: 0, skipped_count: skipped.length });
    }

    await patchCampaign(campaign.id, { status: 'sending' });

    try {
      const response = await sendBatchEmailsWithResend(sendable.map((entry) => entry.item));
      const data = response.data ?? [];
      const sentAt = new Date().toISOString();
      let sentCount = 0;
      let failedCount = 0;

      for (const [index, entry] of sendable.entries()) {
        const resendEmailId = data[index]?.id ?? null;
        const succeeded = Boolean(resendEmailId);
        if (succeeded) sentCount += 1;
        if (!succeeded) failedCount += 1;
        await patchCampaignRecipient(entry.recipientId, {
          status: succeeded ? 'sent' : 'failed',
          resend_email_id: resendEmailId,
          resend_error: succeeded ? null : 'Missing Resend email id in batch response.',
          sent_at: succeeded ? sentAt : null,
          failed_at: succeeded ? null : sentAt,
          last_event_type: succeeded ? 'email.sent' : 'email.failed',
          last_event_at: sentAt,
          locked_at: null,
          locked_by: null
        });
      }

      await updateCampaignAggregates(campaign.id);
      await finishCampaignIfQueueDrained(campaign.id);
      return NextResponse.json({
        success: true,
        processed_count: sendable.length,
        sent_count: sentCount,
        failed_count: failedCount,
        skipped_count: skipped.length
      });
    } catch (error) {
      const failedAt = new Date().toISOString();
      for (const entry of sendable) {
        await patchCampaignRecipient(entry.recipientId, {
          status: 'failed',
          resend_error: error instanceof Error ? error.message : 'Resend küldési hiba.',
          failed_at: failedAt,
          last_event_type: 'email.failed',
          last_event_at: failedAt,
          locked_at: null,
          locked_by: null
        });
      }
      await updateCampaignAggregates(campaign.id);
      await finishCampaignIfQueueDrained(campaign.id);
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Resend küldési hiba.' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Queue feldolgozási hiba.' }, { status: 500 });
  }
}
