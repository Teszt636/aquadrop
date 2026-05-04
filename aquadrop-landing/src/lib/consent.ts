export const CONSENT_KEY = 'aquadrop_cookie_consent';

export type ConsentChoice = 'accepted' | 'rejected';

export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(CONSENT_KEY);
  if (value === 'accepted' || value === 'rejected') {
    return value;
  }

  return null;
}

export function hasAnalyticsConsent(): boolean {
  return getStoredConsent() === 'accepted';
}

export function hasMarketingConsent(): boolean {
  return getStoredConsent() === 'accepted';
}
