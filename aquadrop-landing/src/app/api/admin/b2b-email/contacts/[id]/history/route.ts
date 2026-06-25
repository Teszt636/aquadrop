import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import {
  fetchCampaignsByIds,
  fetchContactById,
  listContactCampaignRecipients,
  listContactSendAttempts,
  listEventsByResendEmailIds,
  type B2BEmailEvent
} from '@/lib/admin/b2b-email-store';

type EmailHistoryItem = {
  id: string;
  source: 'campaign_recipient' | 'send_attempt';
  campaign_id: string | null;
  campaign_name: string | null;
  campaign_recipient_id: string | null;
  email: string;
  subject: string | null;
  status: string;
  last_event_type: string | null;
  resend_email_id: string | null;
  resend_error: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  failed_at: string | null;
  complained_at: string | null;
  created_at: string;
  events: B2BEmailEvent[];
};

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

    const [recipients, attempts] = await Promise.all([listContactCampaignRecipients(contact.id), listContactSendAttempts(contact.id)]);
    const campaignIds = [
      ...recipients.map((recipient) => recipient.campaign_id),
      ...attempts.map((attempt) => attempt.campaign_id).filter((campaignId): campaignId is string => Boolean(campaignId))
    ];
    const campaigns = await fetchCampaignsByIds(campaignIds);
    const campaignsById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
    const resendIds = [
      ...recipients.map((recipient) => recipient.resend_email_id),
      ...attempts.map((attempt) => attempt.resend_email_id)
    ].filter((resendEmailId): resendEmailId is string => Boolean(resendEmailId));
    const events = await listEventsByResendEmailIds(resendIds);
    const eventsByResendId = events.reduce<Map<string, B2BEmailEvent[]>>((accumulator, event) => {
      if (!event.resend_email_id) return accumulator;
      const existing = accumulator.get(event.resend_email_id) ?? [];
      existing.push(event);
      accumulator.set(event.resend_email_id, existing);
      return accumulator;
    }, new Map());

    const recipientHistory: EmailHistoryItem[] = recipients.map((recipient) => {
      const campaign = campaignsById.get(recipient.campaign_id);
      return {
        id: recipient.id,
        source: 'campaign_recipient',
        campaign_id: recipient.campaign_id,
        campaign_name: campaign?.name ?? null,
        campaign_recipient_id: recipient.id,
        email: recipient.email,
        subject: campaign?.subject_snapshot ?? null,
        status: recipient.status,
        last_event_type: recipient.last_event_type,
        resend_email_id: recipient.resend_email_id,
        resend_error: recipient.resend_error,
        sent_at: recipient.sent_at,
        delivered_at: recipient.delivered_at,
        opened_at: recipient.opened_at,
        clicked_at: recipient.clicked_at,
        bounced_at: recipient.bounced_at,
        failed_at: recipient.failed_at,
        complained_at: recipient.complained_at,
        created_at: recipient.created_at,
        events: recipient.resend_email_id ? eventsByResendId.get(recipient.resend_email_id) ?? [] : []
      };
    });

    const attemptHistory: EmailHistoryItem[] = attempts.map((attempt) => {
      const campaign = attempt.campaign_id ? campaignsById.get(attempt.campaign_id) : null;
      return {
        id: attempt.id,
        source: 'send_attempt',
        campaign_id: attempt.campaign_id,
        campaign_name: campaign?.name ?? null,
        campaign_recipient_id: attempt.campaign_recipient_id,
        email: attempt.email,
        subject: attempt.subject_snapshot,
        status: attempt.status,
        last_event_type: attempt.last_event_type,
        resend_email_id: attempt.resend_email_id,
        resend_error: attempt.resend_error,
        sent_at: attempt.sent_at,
        delivered_at: attempt.delivered_at,
        opened_at: attempt.opened_at,
        clicked_at: attempt.clicked_at,
        bounced_at: attempt.bounced_at,
        failed_at: attempt.failed_at,
        complained_at: attempt.complained_at,
        created_at: attempt.created_at,
        events: attempt.resend_email_id ? eventsByResendId.get(attempt.resend_email_id) ?? [] : []
      };
    });

    const history = [...recipientHistory, ...attemptHistory].sort((left, right) => {
      const leftTime = left.sent_at ?? left.created_at;
      const rightTime = right.sent_at ?? right.created_at;
      return new Date(rightTime).getTime() - new Date(leftTime).getTime();
    });

    return NextResponse.json({ contact, history });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Email előzmény lekérdezési hiba.' }, { status: 500 });
  }
}
