import { type AdminTableViewName } from '@/lib/admin/table-config';

export const ADMIN_SESSION_COOKIE = 'aquadrop_admin_session';

export type AdminRole = 'admin' | 'crm_user';

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

export const ADMIN_BASE_TABLES = [
  'announcement_signups',
  'unsubscribed',
  'media_kit_downloads',
  'gift_claims',
  'reseller_applications',
  'admin_users'
] as const satisfies readonly AdminTableViewName[];

export const ADMIN_ROUTE_TABLES: AdminTableViewName[] = [...ADMIN_BASE_TABLES];

export type AdminTableName = AdminTableViewName;

export const ADMIN_TABLE_SET = new Set<string>(ADMIN_ROUTE_TABLES);

export const MAIN_ADMIN_EMAIL = 'admin@aquadrop.hu';
