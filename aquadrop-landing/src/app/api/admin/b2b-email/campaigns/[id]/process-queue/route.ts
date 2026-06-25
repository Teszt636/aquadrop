import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import {
  fetchCampaignById,
  fetchContactById,
  fetchNextQueuedCampaignRecipient,
  finishCampaignIfQueueDrained,
  isSuppressedContact,
  listDueQueuedCampaignRecipients,
  listCampaignRecipients,
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

type ProcessMode = 'single' | 'batch';

function getProcessMode(value: unknown): ProcessMode {
  return value === 'batch' ? 'batch' : 'single';
}

async function getQueueState(campaignId: string): Promise<{ nextScheduledAt: string | null; queueFinished: boolean }> {
  const [nextRecipient, recipients] = await Promise.all([
    fetchNextQueuedCampaignRecipient(campaignId),
    listCampaignRecipients(campaignId)
  ]);
  const hasOpenQueue = recipients.some((recipient) => ['pending', 'queued', 'processing'].includes(recipient.status));
  return {
    nextScheduledAt: nextRecipient?.scheduled_at ?? null,
    queueFinished: !hasOpenQueue
  };
}

function buildQueueMessage(input: {
  sentCount: number;
  processedCount: number;
  failedCount?: number;
  nextScheduledAt: string | null;
  queueFinished: boolean;
}): string {
  if (input.queueFinished) return 'A kampány küldési sora befejeződött.';
  if (input.sentCount > 0) return `1 email elküldve. Következő esedékes küldés: ${input.nextScheduledAt ?? '-'}`;
  if ((input.failedCount ?? 0) > 0 || input.processedCount > 0) return `A feldolgozás lefutott. Következő esedékes küldés: ${input.nextScheduledAt ?? '-'}`;
  return `Még nincs esedékes címzett. A következő küldés időpontja: ${input.nextScheduledAt ?? '-'}`;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { mode?: unknown };
    const mode = getProcessMode(body.mode);
    const campaign = await fetchCampaignById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'A kampány nem található.' }, { status: 404 });
    }

    if (!campaign.subject_snapshot || !campaign.html_snapshot) {
      return NextResponse.json({ error: 'A kampány snapshotja hiányos.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const limit = mode === 'single' ? 1 : Math.min(10, Math.max(1, campaign.max_emails_per_process ?? 10));
    const candidateLimit = mode === 'single' ? 100 : limit;
    const dueRecipients = await listDueQueuedCampaignRecipients(campaign.id, now, candidateLimit);
    const sendable: Array<{ recipientId: string; attemptCount: number; item: SendBatchEmailItem }> = [];
    const skipped: string[] = [];
    const processorId = `admin:${sessionUser.email}`;

    for (const recipient of dueRecipients) {
      if (sendable.length >= limit) break;
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
      const queueState = await getQueueState(campaign.id);
      return NextResponse.json({
        success: true,
        mode,
        processed_count: 0,
        sent_count: 0,
        skipped_count: skipped.length,
        next_scheduled_at: queueState.nextScheduledAt,
        queue_finished: queueState.queueFinished,
        message: buildQueueMessage({
          sentCount: 0,
          processedCount: 0,
          nextScheduledAt: queueState.nextScheduledAt,
          queueFinished: queueState.queueFinished
        })
      });
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
      const queueState = await getQueueState(campaign.id);
      return NextResponse.json({
        success: true,
        mode,
        processed_count: sendable.length,
        sent_count: sentCount,
        failed_count: failedCount,
        skipped_count: skipped.length,
        next_scheduled_at: queueState.nextScheduledAt,
        queue_finished: queueState.queueFinished,
        message: buildQueueMessage({
          sentCount,
          processedCount: sendable.length,
          failedCount,
          nextScheduledAt: queueState.nextScheduledAt,
          queueFinished: queueState.queueFinished
        })
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
