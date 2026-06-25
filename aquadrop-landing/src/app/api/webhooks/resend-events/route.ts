import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import {
  eventExists,
  fetchRecipientByResendEmailId,
  insertEvent,
  patchCampaignRecipient,
  patchContact,
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
  return {};
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
    const recipient = resendEmailId ? await fetchRecipientByResendEmailId(resendEmailId) : null;
    const now = new Date().toISOString();
    const mapped = mapEventToRecipientStatus(eventType);

    await insertEvent({
      svix_id: svixId,
      resend_email_id: resendEmailId,
      event_type: eventType,
      recipient_email: recipientEmail,
      campaign_recipient_id: recipient?.id ?? null,
      payload
    });

    if (recipient) {
      const recipientUpdates: Record<string, unknown> = {
        last_event_type: eventType,
        last_event_at: now
      };
      if (mapped.status) recipientUpdates.status = mapped.status;
      if (mapped.timestampField) recipientUpdates[mapped.timestampField] = now;
      await patchCampaignRecipient(recipient.id, recipientUpdates);

      if (recipient.contact_id) {
        const contactUpdates: Record<string, unknown> = {
          last_email_status: eventType,
          last_email_event_at: now
        };
        if (mapped.contactField) {
          contactUpdates[mapped.contactField] = now;
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
