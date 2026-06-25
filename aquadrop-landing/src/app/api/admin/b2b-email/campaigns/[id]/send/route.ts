import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import {
  fetchCampaignById,
  fetchContactById,
  isSuppressedContact,
  listQueueableCampaignRecipients,
  patchCampaign,
  patchCampaignRecipient,
  updateCampaignAggregates
} from '@/lib/admin/b2b-email-store';

type SendRequestBody = {
  confirmSend?: boolean;
  per_email_delay_seconds?: number;
  max_emails_per_process?: number;
  scheduled_start_at?: string | null;
};

function sanitizeInteger(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function parseScheduledStartAt(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Érvénytelen kezdési időpont.');
  }
  return parsed;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  const body = (await request.json()) as SendRequestBody;
  if (body.confirmSend !== true) {
    return NextResponse.json({ error: 'A küldési sor indításához confirmSend: true szükséges.' }, { status: 400 });
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

    const perEmailDelaySeconds = sanitizeInteger(
      body.per_email_delay_seconds,
      campaign.per_email_delay_seconds ?? 30,
      0,
      3600
    );
    const maxEmailsPerProcess = sanitizeInteger(
      body.max_emails_per_process,
      campaign.max_emails_per_process ?? 10,
      1,
      100
    );
    const requestedStart = parseScheduledStartAt(body.scheduled_start_at);
    const campaignStart = parseScheduledStartAt(campaign.scheduled_start_at);
    const startDate = requestedStart ?? campaignStart ?? new Date();
    const queueableRecipients = await listQueueableCampaignRecipients(campaign.id);
    const queueCandidates: Array<{ id: string; scheduledAt: string }> = [];
    const skipped: Array<{ id: string; status: 'suppressed' | 'skipped' }> = [];
    const now = new Date().toISOString();

    for (const recipient of queueableRecipients) {
      const contact = recipient.contact_id ? await fetchContactById(recipient.contact_id) : null;
      if (!contact || isSuppressedContact(contact)) {
        skipped.push({ id: recipient.id, status: contact?.suppressed_at ? 'suppressed' : 'skipped' });
        continue;
      }

      if (queueCandidates.length >= 100) {
        return NextResponse.json({ error: 'Egy kampány legfeljebb 100 aktív címzettnek állítható sorba.' }, { status: 400 });
      }

      const scheduledAt = new Date(startDate.getTime() + queueCandidates.length * perEmailDelaySeconds * 1000).toISOString();
      queueCandidates.push({ id: recipient.id, scheduledAt });
    }

    for (const skippedRecipient of skipped) {
      await patchCampaignRecipient(skippedRecipient.id, {
        status: skippedRecipient.status,
        last_event_type: 'skipped',
        last_event_at: now
      });
    }

    for (const recipient of queueCandidates) {
      await patchCampaignRecipient(recipient.id, {
        status: 'queued',
        scheduled_at: recipient.scheduledAt,
        queued_at: now,
        processing_started_at: null,
        locked_at: null,
        locked_by: null,
        resend_error: null,
        last_event_type: 'queued',
        last_event_at: now
      });
    }

    if (queueCandidates.length === 0) {
      await updateCampaignAggregates(campaign.id);
      await patchCampaign(campaign.id, { status: skipped.length > 0 ? 'failed' : 'ready' });
      return NextResponse.json({ success: false, error: 'Nincs sorba állítható aktív címzett.', skipped_count: skipped.length }, { status: 400 });
    }

    const firstScheduledAt = queueCandidates[0]?.scheduledAt ?? null;
    const lastScheduledAt = queueCandidates[queueCandidates.length - 1]?.scheduledAt ?? null;
    await updateCampaignAggregates(campaign.id);
    await patchCampaign(campaign.id, {
      status: 'queued',
      sending_mode: 'queued',
      per_email_delay_seconds: perEmailDelaySeconds,
      max_emails_per_process: maxEmailsPerProcess,
      scheduled_start_at: firstScheduledAt,
      queue_started_at: now,
      queue_finished_at: null
    });

    return NextResponse.json({
      success: true,
      queued_count: queueCandidates.length,
      skipped_count: skipped.length,
      first_scheduled_at: firstScheduledAt,
      last_scheduled_at: lastScheduledAt
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Küldési sor indítási hiba.' }, { status: 500 });
  }
}
