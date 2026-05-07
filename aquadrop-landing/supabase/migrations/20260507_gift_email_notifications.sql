alter table public.crm_email_notifications
  add column if not exists notification_slot text;

alter table public.crm_email_notifications
  drop constraint if exists crm_email_notifications_type_check;

alter table public.crm_email_notifications
  drop constraint if exists crm_email_notifications_notification_type_check;

alter table public.crm_email_notifications
  add constraint crm_email_notifications_type_check
  check (notification_type in ('partner_daily_tasks', 'partner_1h_reminder', 'gift_daily_summary'));

create unique index if not exists crm_email_notifications_gift_summary_dedupe_idx
  on public.crm_email_notifications (notification_type, crm_type, recipient_user_id, notification_date, notification_slot)
  where notification_type = 'gift_daily_summary';
