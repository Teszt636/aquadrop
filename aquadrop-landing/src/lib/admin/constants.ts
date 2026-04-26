import { type AdminBaseTableName, type AdminTableViewName } from '@/lib/admin/table-config';

export const ADMIN_SESSION_COOKIE = 'aquadrop_admin_session';

export const ADMIN_BASE_TABLES = [
  'announcement_signups',
  'gift_claims',
  'reseller_applications',
  'media_kit_downloads'
] as const satisfies readonly AdminBaseTableName[];

export const ADMIN_ROUTE_TABLES: AdminTableViewName[] = [...ADMIN_BASE_TABLES, 'unsubscribed'];

export type AdminTableName = AdminTableViewName;

export const ADMIN_TABLE_SET = new Set<string>(ADMIN_ROUTE_TABLES);
