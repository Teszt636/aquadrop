export const ADMIN_SESSION_COOKIE = 'aquadrop_admin_session';

export const ADMIN_TABLES = [
  'announcement_signups',
  'gift_claims',
  'reseller_applications',
  'media_kit_downloads'
] as const;

export type AdminTableName = (typeof ADMIN_TABLES)[number];

export const ADMIN_TABLE_SET = new Set<string>(ADMIN_TABLES);
