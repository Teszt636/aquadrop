import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/admin/auth';
import {
  fetchCampaignById,
  fetchCampaignRecipientById,
  fetchContactById,
  fetchSendAttemptById,
  fetchTemplateById,
  insertSendAttempt
} from '@/lib/admin/b2b-email-store';
import { renderB2BTemplate, sanitizeEmailAddress } from '@/lib/email/b2b-campaigns';
import { sendBatchEmailsWithResend } from '@/lib/email/resend';

function getFromEmail(): string {
  const value = process.env.RESEND_FROM_EMAIL;
  if (!value) {
    throw new Error('Missing RESEND_FROM_EMAIL.');
  }
  return value;
}

function getText(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionUser = await requireAdminSession(['admin']);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Ehhez a művelethez admin jogosultság szükséges.' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    if (body.confirmSend !== true) {
      return NextResponse.json({ error: 'Az újraküldést külön meg kell erősíteni.' }, { status: 400 });
    }

    const contact = await fetchContactById(id);
    if (!contact || contact.deleted_at) {
      return NextResponse.json({ error: 'A címzett nem található.' }, { status: 404 });
    }
    if (contact.unsubscribed_at || contact.complained_at || contact.suppressed_at) {
      return NextResponse.json(
        { error: 'Erre a címzettre nem küldhető új email, mert leiratkozott, panaszt tett vagy tiltólistára került.' },
        { status: 400 }
      );
    }

    const campaignRecipientId = getText(body.campaignRecipientId);
    const sendAttemptId = getText(body.sendAttemptId);
    const sourceAttempt = sendAttemptId ? await fetchSendAttemptById(sendAttemptId) : null;
    const sourceRecipientId = campaignRecipientId ?? sourceAttempt?.campaign_recipient_id ?? null;
    if (!sourceRecipientId) {
      return NextResponse.json({ error: 'Hiányzik az eredeti kampány címzett rekord az újraküldéshez.' }, { status: 400 });
    }

    const recipient = await fetchCampaignRecipientById(sourceRecipientId);
    if (!recipient || recipient.contact_id !== contact.id) {
      return NextResponse.json({ error: 'Az eredeti kampány címzett rekord nem található ehhez a címzetthez.' }, { status: 404 });
    }

    const campaign = await fetchCampaignById(recipient.campaign_id);
    if (!campaign) {
      return NextResponse.json({ error: 'Az eredeti kampány nem található.' }, { status: 404 });
    }

    let subject = campaign.subject_snapshot;
    let htmlBody = campaign.html_snapshot;
    let textBody = campaign.text_snapshot;
    if ((!subject || !htmlBody) && campaign.template_id) {
      const template = await fetchTemplateById(campaign.template_id);
      subject = subject ?? template?.subject ?? null;
      htmlBody = htmlBody ?? template?.html_body ?? null;
      textBody = textBody ?? template?.text_body ?? null;
    }
    if (!subject || !htmlBody) {
      return NextResponse.json({ error: 'Az újraküldéshez nincs használható kampány snapshot vagy sablon.' }, { status: 400 });
    }

    const rendered = renderB2BTemplate({ subject, htmlBody, textBody, contact });
    const to = sanitizeEmailAddress(contact.email);
    const sentAt = new Date().toISOString();
    const baseAttempt = {
      campaign_id: campaign.id,
      campaign_recipient_id: recipient.id,
      contact_id: contact.id,
      email: to,
      attempt_type: 'manual_resend',
      subject_snapshot: rendered.subject,
      created_by_email: sessionUser.email ?? null
    };

    try {
      const response = await sendBatchEmailsWithResend([
        {
          from: getFromEmail(),
          to,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          tags: [
            { name: 'campaign_id', value: campaign.id },
            { name: 'campaign_recipient_id', value: recipient.id },
            { name: 'source', value: 'aquadrop_b2b_manual_resend' }
          ]
        }
      ]);
      const resendEmailId = response.data?.[0]?.id ?? null;
      const attempt = await insertSendAttempt({
        ...baseAttempt,
        status: resendEmailId ? 'sent' : 'failed',
        resend_email_id: resendEmailId,
        resend_error: resendEmailId ? null : 'Missing Resend email id in batch response.',
        sent_at: resendEmailId ? sentAt : null,
        failed_at: resendEmailId ? null : sentAt,
        last_event_type: resendEmailId ? 'email.sent' : 'email.failed',
        last_event_at: sentAt
      });

      return NextResponse.json({ success: Boolean(resendEmailId), attempt });
    } catch (error) {
      const failedAt = new Date().toISOString();
      const attempt = await insertSendAttempt({
        ...baseAttempt,
        status: 'failed',
        resend_error: error instanceof Error ? error.message : 'Resend újraküldési hiba.',
        failed_at: failedAt,
        last_event_type: 'email.failed',
        last_event_at: failedAt
      });
      return NextResponse.json({ error: attempt.resend_error, attempt }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Újraküldési hiba.' }, { status: 500 });
  }
}
