import { type EmailNotificationRequest } from '@/lib/email/types';

export async function triggerFormNotification(request: EmailNotificationRequest): Promise<void> {
  try {
    const response = await fetch('/api/email/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Notification API returned status ${response.status}`);
    }
  } catch (error) {
    console.error('Form email notification failed:', error);
  }
}
