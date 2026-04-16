import { trackEvent, type TrackingEventName, type TrackingPayload } from '@/lib/tracking';

export const LEAD_AUTOMATION_HOOK = 'aquadrop:lead_captured';
const LEAD_AUTOMATION_STORAGE_KEY = 'aquadrop_lead_events';

const WEBHOOK_ENDPOINT = process.env.NEXT_PUBLIC_LEAD_AUTOMATION_WEBHOOK_URL;

export type LeadType = 'gift_campaign' | 'newsletter_signup' | 'reseller_application';

export type LeadAutomationPayload = {
  lead_type: LeadType;
  email?: string;
  phone?: string | null;
  full_name?: string;
  source?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

function isClient() {
  return typeof window !== 'undefined';
}

function saveLeadToLocalQueue(payload: LeadAutomationPayload) {
  if (!isClient()) {
    return;
  }

  const existingQueue = window.localStorage.getItem(LEAD_AUTOMATION_STORAGE_KEY);
  let parsedQueue: LeadAutomationPayload[] = [];

  if (existingQueue) {
    try {
      parsedQueue = JSON.parse(existingQueue) as LeadAutomationPayload[];
    } catch {
      parsedQueue = [];
    }
  }

  parsedQueue.push(payload);

  window.localStorage.setItem(LEAD_AUTOMATION_STORAGE_KEY, JSON.stringify(parsedQueue));
}

function dispatchLeadCapturedEvent(payload: LeadAutomationPayload) {
  if (!isClient()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(LEAD_AUTOMATION_HOOK, {
      detail: payload
    })
  );
}

function notifyWebhook(payload: LeadAutomationPayload) {
  if (!isClient() || !WEBHOOK_ENDPOINT) {
    return;
  }

  const body = JSON.stringify({
    ...payload,
    captured_at: new Date().toISOString()
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(WEBHOOK_ENDPOINT, body);

    return;
  }

  void fetch(WEBHOOK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body,
    keepalive: true
  });
}

export function captureLeadForAutomation(
  eventName: TrackingEventName,
  eventPayload: TrackingPayload,
  leadPayload: LeadAutomationPayload
) {
  trackEvent(eventName, eventPayload);
  saveLeadToLocalQueue(leadPayload);
  dispatchLeadCapturedEvent(leadPayload);
  notifyWebhook(leadPayload);
}
