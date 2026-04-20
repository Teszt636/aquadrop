import { type EmailNotificationRequest } from '@/lib/email/types';

export async function triggerFormNotification(request: EmailNotificationRequest): Promise<void> {
  try {
    console.info('[email][client] Calling /api/email/notifications', {
      type: request.type,
      payloadKeys: Object.keys(request.payload)
    });

    const response = await fetch('/api/email/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    const responseText = await response.text();

    console.info('[email][client] /api/email/notifications response received', {
      status: response.status,
      ok: response.ok,
      body: responseText
    });

    if (!response.ok) {
      throw new Error(`Notification API returned status ${response.status}. Body: ${responseText}`);
    }
  } catch (error) {
    console.error('Form email notification failed:', error);
  }
}
