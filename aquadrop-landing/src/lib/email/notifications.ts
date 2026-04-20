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

const SENDER_EMAIL = 'Aquadrop Ügyfélszolgálat <noreply@aquadrop.hu>';
const REPLY_TO_EMAIL = 'hello@aquadrop.hu';

function getSenderEmail(): string {
  console.info('[email][notifications] Sender email resolved', {
    from: SENDER_EMAIL,
    source: 'STATIC'
  });

  return SENDER_EMAIL;
}

function getReplyToEmail(): string {
  console.info('[email][notifications] Reply-to email resolved', {
    replyTo: REPLY_TO_EMAIL,
    source: 'STATIC'
  });

  return REPLY_TO_EMAIL;
}

function getAdminEmail(): string {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!adminEmail) {
    console.error('[email][notifications] Missing ADMIN_NOTIFICATION_EMAIL');
    throw new Error('Missing required server environment variable: ADMIN_NOTIFICATION_EMAIL');
  }

  console.info('[email][notifications] Admin recipient resolved', {
    adminEmail
  });

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
  const replyTo = getReplyToEmail();
  const submittedAt = getSubmittedAt();

  console.info('[email][notifications] Preparing form notifications', {
    type: request.type,
    recipientEmail: request.payload.email,
    adminEmail,
    from,
    replyTo
  });

  switch (request.type) {
    case 'announcement_signup': {
      if (!request.payload.name || !request.payload.email) {
        console.error('[email][notifications] Invalid announcement_signup payload', request.payload);
      }
      const userEmail = buildAnnouncementUserEmail(request.payload.name);
      const adminTemplate = buildAnnouncementAdminEmail({ ...request.payload, submittedAt });

      const [userResponse, adminResponse] = await Promise.all([
        sendEmailWithResend({
          from,
          to: request.payload.email,
          subject: userEmail.subject,
          html: userEmail.html,
          replyTo
        }),
        sendEmailWithResend({
          from,
          to: adminEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
          replyTo
        })
      ]);
      console.info('[email][notifications] announcement_signup emails sent', {
        userEmailId: userResponse.id,
        adminEmailId: adminResponse.id
      });
      return;
    }

    case 'gift_claim': {
      if (
        !request.payload.fullName ||
        !request.payload.email ||
        !request.payload.phone ||
        !request.payload.shippingAddress ||
        !request.payload.purchaseLocation ||
        !request.payload.purchaseDate
      ) {
        console.error('[email][notifications] Invalid gift_claim payload', request.payload);
      }
      const userEmail = buildGiftUserEmail(request.payload.fullName);
      const adminTemplate = buildGiftAdminEmail({ ...request.payload, submittedAt });

      const [userResponse, adminResponse] = await Promise.all([
        sendEmailWithResend({
          from,
          to: request.payload.email,
          subject: userEmail.subject,
          html: userEmail.html,
          replyTo
        }),
        sendEmailWithResend({
          from,
          to: adminEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
          replyTo
        })
      ]);
      console.info('[email][notifications] gift_claim emails sent', {
        userEmailId: userResponse.id,
        adminEmailId: adminResponse.id
      });
      return;
    }

    case 'reseller_application': {
      if (
        !request.payload.companyName ||
        !request.payload.contactName ||
        !request.payload.email ||
        !request.payload.phone ||
        !request.payload.salesChannel
      ) {
        console.error('[email][notifications] Invalid reseller_application payload', request.payload);
      }
      const userEmail = buildResellerUserEmail(request.payload.contactName);
      const adminTemplate = buildResellerAdminEmail({ ...request.payload, submittedAt });

      const [userResponse, adminResponse] = await Promise.all([
        sendEmailWithResend({
          from,
          to: request.payload.email,
          subject: userEmail.subject,
          html: userEmail.html,
          replyTo
        }),
        sendEmailWithResend({
          from,
          to: adminEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
          replyTo
        })
      ]);
      console.info('[email][notifications] reseller_application emails sent', {
        userEmailId: userResponse.id,
        adminEmailId: adminResponse.id
      });
      return;
    }

    default: {
      const exhaustiveCheck: never = request;
      throw new Error(`Unsupported notification type: ${JSON.stringify(exhaustiveCheck)}`);
    }
  }
}
