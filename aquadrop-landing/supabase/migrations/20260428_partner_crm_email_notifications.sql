alter table public.reseller_applications
  add column if not exists daily_task_email_sent_at timestamptz,
  add column if not exists reminder_1h_email_sent_at timestamptz;

create table if not exists public.crm_email_notifications (
  id uuid primary key default gen_random_uuid(),
  notification_type text not null,
  crm_type text not null default 'partner',
  recipient_user_id uuid references public.admin_users(id) on delete set null,
  recipient_email text not null,
  reseller_application_id uuid references public.reseller_applications(id) on delete set null,
  notification_date date,
  next_action_at_snapshot timestamptz,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint crm_email_notifications_type_check
    check (notification_type in ('partner_daily_tasks', 'partner_1h_reminder'))
);

create index if not exists crm_email_notifications_recipient_user_idx
  on public.crm_email_notifications (recipient_user_id, notification_type, notification_date desc);

create index if not exists crm_email_notifications_reseller_idx
  on public.crm_email_notifications (reseller_application_id, notification_type, next_action_at_snapshot desc);

create unique index if not exists crm_email_notifications_daily_dedupe_idx
  on public.crm_email_notifications (notification_type, crm_type, recipient_user_id, notification_date)
  where notification_type = 'partner_daily_tasks';

create unique index if not exists crm_email_notifications_reminder_dedupe_idx
  on public.crm_email_notifications (notification_type, crm_type, reseller_application_id, next_action_at_snapshot)
  where notification_type = 'partner_1h_reminder';
