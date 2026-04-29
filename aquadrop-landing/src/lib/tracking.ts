export const TRACKING_EVENT_NAMES = [
  'hero_primary_cta_click',
  'hero_secondary_cta_click',
  'gift_form_submit',
  'newsletter_form_submit',
  'partner_cta_click',
  'partner_form_submit',
  'final_cta_gift_click',
  'final_cta_newsletter_click',
  'final_cta_partner_click',
  'problem_card_capsule_not_dissolving_click',
  'problem_card_high_washing_cost_click',
  'problem_card_low_temp_cleaning_click',
  'media_kit_lead_submit',
  'media_kit_download',
  'scroll_depth_25',
  'scroll_depth_50',
  'scroll_depth_75',
  'scroll_depth_100',
  'google_review_cta_click'
] as const;

export type TrackingEventName = (typeof TRACKING_EVENT_NAMES)[number];

export type TrackingPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: 'event', eventName: string, params?: Record<string, unknown>) => void;
    fbq?: (command: 'trackCustom', eventName: string, params?: Record<string, unknown>) => void;
  }
}

function isClient() {
  return typeof window !== 'undefined';
}

export function trackEvent(eventName: TrackingEventName, payload: TrackingPayload = {}) {
  if (!isClient()) {
    return;
  }

  const eventPayload = {
    ...payload,
    event_name: eventName
  };

  window.dataLayer?.push({
    event: eventName,
    ...eventPayload
  });

  window.gtag?.('event', eventName, eventPayload);
  window.fbq?.('trackCustom', eventName, eventPayload);

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[tracking]', eventName, eventPayload);
  }
}

export const SCROLL_DEPTH_THRESHOLDS = [25, 50, 75, 100] as const;

export type ScrollDepthThreshold = (typeof SCROLL_DEPTH_THRESHOLDS)[number];

export function getScrollDepthEventName(threshold: ScrollDepthThreshold): TrackingEventName {
  return `scroll_depth_${threshold}`;
}
