import {
  buildAnnouncementAdminEmail,
  buildAnnouncementUserEmail,
  buildGiftAdminEmail,
  buildGiftUserEmail,
  buildResellerAdminEmail,
  buildResellerUserEmail
} from '@/lib/email/templates';
import { sendEmailWithResend } from '@/lib/email/resend';
import { type EmailNotificationRequest } from '@/lib/email/types';

const DEFAULT_SENDER = 'Aquadrop <noreply@aquadrop.hu>';

function getSenderEmail(): string {
  return process.env.EMAIL_FROM ?? DEFAULT_SENDER;
}

function getAdminEmail(): string {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!adminEmail) {
    throw new Error('Missing required server environment variable: ADMIN_NOTIFICATION_EMAIL');
  }

  return adminEmail;
}

function getSubmittedAt(): string {
  return new Date().toLocaleString('hu-HU', {
    timeZone: 'Europe/Budapest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export async function sendFormNotifications(request: EmailNotificationRequest): Promise<void> {
  const from = getSenderEmail();
  const adminEmail = getAdminEmail();
  const submittedAt = getSubmittedAt();

  switch (request.type) {
    case 'announcement_signup': {
      const userEmail = buildAnnouncementUserEmail(request.payload.name);
      const adminTemplate = buildAnnouncementAdminEmail({ ...request.payload, submittedAt });

      await Promise.all([
        sendEmailWithResend({
          from,
          to: request.payload.email,
          subject: userEmail.subject,
          html: userEmail.html
        }),
        sendEmailWithResend({
          from,
          to: adminEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html
        })
      ]);
      return;
    }

    case 'gift_claim': {
      const userEmail = buildGiftUserEmail(request.payload.fullName);
      const adminTemplate = buildGiftAdminEmail({ ...request.payload, submittedAt });

      await Promise.all([
        sendEmailWithResend({
          from,
          to: request.payload.email,
          subject: userEmail.subject,
          html: userEmail.html
        }),
        sendEmailWithResend({
          from,
          to: adminEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html
        })
      ]);
      return;
    }

    case 'reseller_application': {
      const userEmail = buildResellerUserEmail(request.payload.contactName);
      const adminTemplate = buildResellerAdminEmail({ ...request.payload, submittedAt });

      await Promise.all([
        sendEmailWithResend({
          from,
          to: request.payload.email,
          subject: userEmail.subject,
          html: userEmail.html
        }),
        sendEmailWithResend({
          from,
          to: adminEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html
        })
      ]);
      return;
    }

    default: {
      const exhaustiveCheck: never = request;
      throw new Error(`Unsupported notification type: ${JSON.stringify(exhaustiveCheck)}`);
    }
  }
}
