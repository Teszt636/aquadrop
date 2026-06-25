import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import {
  eventExists,
  fetchRecipientByResendEmailId,
  fetchSendAttemptByResendEmailId,
  insertEvent,
  patchCampaignRecipient,
  patchContact,
  patchSendAttempt,
  updateCampaignAggregates
} from '@/lib/admin/b2b-email-store';

type ResendWebhookPayload = {
  type?: string;
  data?: {
    email_id?: string;
    to?: string | string[];
    recipient?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function getWebhookSecret(): string {
  const value = process.env.RESEND_WEBHOOK_SECRET;
  if (!value) {
    throw new Error('Missing RESEND_WEBHOOK_SECRET.');
  }
  return value;
}

function verifyPayload(rawBody: string, request: Request): ResendWebhookPayload {
  const webhook = new Webhook(getWebhookSecret());
  return webhook.verify(rawBody, {
    'svix-id': request.headers.get('svix-id') ?? '',
    'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
    'svix-signature': request.headers.get('svix-signature') ?? ''
  }) as ResendWebhookPayload;
}

function getRecipientEmail(payload: ResendWebhookPayload): string | null {
  const value = payload.data?.recipient ?? payload.data?.to;
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === 'string' ? value : null;
}

function mapEventToRecipientStatus(eventType: string): {
  status?: string;
  timestampField?: string;
  contactField?: string;
} {
  if (eventType === 'email.sent') return { status: 'sent', timestampField: 'sent_at' };
  if (eventType === 'email.delivered') return { status: 'delivered', timestampField: 'delivered_at' };
  if (eventType === 'email.bounced') return { status: 'bounced', timestampField: 'bounced_at', contactField: 'bounced_at' };
  if (eventType === 'email.failed') return { status: 'failed', timestampField: 'failed_at' };
  if (eventType === 'email.complained') return { status: 'complained', timestampField: 'complained_at', contactField: 'complained_at' };
  if (eventType === 'email.suppressed') return { status: 'suppressed', contactField: 'suppressed_at' };
  if (eventType === 'email.opened') return { timestampField: 'opened_at' };
  if (eventType === 'email.clicked') return { timestampField: 'clicked_at' };
  return {};
}

function getEventTimestamp(payload: ResendWebhookPayload): string {
  const value = payload.created_at ?? payload.data?.created_at;
  return typeof value === 'string' && value ? new Date(value).toISOString() : new Date().toISOString();
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const svixId = request.headers.get('svix-id');

  if (!svixId) {
    return NextResponse.json({ error: 'Missing svix-id header.' }, { status: 400 });
  }

  try {
    const payload = verifyPayload(rawBody, request);
    if (await eventExists(svixId)) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    const eventType = payload.type ?? 'unknown';
    const resendEmailId = payload.data?.email_id ?? null;
    const recipientEmail = getRecipientEmail(payload);
    const attempt = resendEmailId ? await fetchSendAttemptByResendEmailId(resendEmailId) : null;
    const recipient = resendEmailId && !attempt ? await fetchRecipientByResendEmailId(resendEmailId) : null;
    const eventAt = getEventTimestamp(payload);
    const mapped = mapEventToRecipientStatus(eventType);

    await insertEvent({
      svix_id: svixId,
      resend_email_id: resendEmailId,
      event_type: eventType,
      recipient_email: recipientEmail,
      campaign_recipient_id: attempt?.campaign_recipient_id ?? recipient?.id ?? null,
      payload
    });

    if (attempt) {
      const attemptUpdates: Record<string, unknown> = {
        last_event_type: eventType,
        last_event_at: eventAt
      };
      if (mapped.status) attemptUpdates.status = mapped.status;
      if (mapped.timestampField) attemptUpdates[mapped.timestampField] = eventAt;
      await patchSendAttempt(attempt.id, attemptUpdates);

      if (attempt.contact_id) {
        const contactUpdates: Record<string, unknown> = {
          last_email_status: eventType,
          last_email_event_at: eventAt
        };
        if (mapped.contactField) {
          contactUpdates[mapped.contactField] = eventAt;
          contactUpdates.is_active = false;
        }
        await patchContact(attempt.contact_id, contactUpdates);
      }

      if (attempt.campaign_id) {
        await updateCampaignAggregates(attempt.campaign_id);
      }
    } else if (recipient) {
      const recipientUpdates: Record<string, unknown> = {
        last_event_type: eventType,
        last_event_at: eventAt
      };
      if (mapped.status) recipientUpdates.status = mapped.status;
      if (mapped.timestampField) recipientUpdates[mapped.timestampField] = eventAt;
      await patchCampaignRecipient(recipient.id, recipientUpdates);

      if (recipient.contact_id) {
        const contactUpdates: Record<string, unknown> = {
          last_email_status: eventType,
          last_email_event_at: eventAt
        };
        if (mapped.contactField) {
          contactUpdates[mapped.contactField] = eventAt;
          contactUpdates.is_active = false;
        }
        await patchContact(recipient.contact_id, contactUpdates);
      }

      await updateCampaignAggregates(recipient.campaign_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook feldolgozási hiba.' }, { status: 400 });
  }
}
