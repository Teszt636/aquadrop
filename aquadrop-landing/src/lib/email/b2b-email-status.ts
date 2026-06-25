export type B2BStatusTone = 'slate' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';

export type B2BStatusLabel = {
  label: string;
  tone: B2BStatusTone;
  description?: string;
};

const emailEventLabels: Record<string, B2BStatusLabel> = {
  'email.sent': { label: 'Elküldve', tone: 'cyan' },
  'email.delivered': { label: 'Kézbesítve', tone: 'emerald' },
  'email.bounced': { label: 'Visszapattant', tone: 'rose' },
  'email.failed': { label: 'Sikertelen', tone: 'rose' },
  'email.delivery_delayed': { label: 'Kézbesítés késik', tone: 'amber' },
  'email.complained': { label: 'Spamként jelölte', tone: 'rose' },
  'email.suppressed': { label: 'Tiltólistán / nem küldhető', tone: 'rose' },
  'email.opened': { label: 'Megnyitotta', tone: 'violet' },
  'email.clicked': { label: 'Kattintott', tone: 'violet' }
};

const recipientStatusLabels: Record<string, B2BStatusLabel> = {
  pending: { label: 'Függőben', tone: 'slate' },
  queued: { label: 'Sorban áll', tone: 'amber' },
  processing: { label: 'Feldolgozás alatt', tone: 'amber' },
  sent: { label: 'Elküldve', tone: 'cyan' },
  delivered: { label: 'Kézbesítve', tone: 'emerald' },
  bounced: { label: 'Visszapattant', tone: 'rose' },
  failed: { label: 'Sikertelen', tone: 'rose' },
  complained: { label: 'Spamként jelölte', tone: 'rose' },
  suppressed: { label: 'Tiltólistán', tone: 'rose' },
  skipped: { label: 'Kihagyva', tone: 'slate' }
};

const campaignStatusLabels: Record<string, B2BStatusLabel> = {
  draft: { label: 'Vázlat', tone: 'slate' },
  ready: { label: 'Küldésre kész', tone: 'cyan' },
  queued: { label: 'Sorban áll', tone: 'amber' },
  sending: { label: 'Küldés alatt', tone: 'amber' },
  sent: { label: 'Elküldve', tone: 'emerald' },
  partial_failed: { label: 'Részben sikertelen', tone: 'amber' },
  failed: { label: 'Sikertelen', tone: 'rose' },
  cancelled: { label: 'Megszakítva', tone: 'slate' }
};

const fallbackLabel: B2BStatusLabel = {
  label: 'Ismeretlen státusz',
  tone: 'slate'
};

export function getB2BEmailEventLabel(eventType: string | null | undefined): B2BStatusLabel {
  if (!eventType) return { label: '-', tone: 'slate' };
  return emailEventLabels[eventType] ?? { ...fallbackLabel, description: eventType };
}

export function getB2BRecipientStatusLabel(status: string | null | undefined): B2BStatusLabel {
  if (!status) return { label: '-', tone: 'slate' };
  return recipientStatusLabels[status] ?? { ...fallbackLabel, description: status };
}

export function getB2BCampaignStatusLabel(status: string | null | undefined): B2BStatusLabel {
  if (!status) return { label: '-', tone: 'slate' };
  return campaignStatusLabels[status] ?? { ...fallbackLabel, description: status };
}
