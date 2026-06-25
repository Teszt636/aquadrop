alter table public.b2b_email_campaign_recipients
  add column if not exists opened_at timestamptz,
  add column if not exists clicked_at timestamptz;

create table if not exists public.b2b_email_send_attempts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.b2b_email_campaigns(id) on delete set null,
  campaign_recipient_id uuid references public.b2b_email_campaign_recipients(id) on delete set null,
  contact_id uuid references public.b2b_email_contacts(id) on delete set null,
  email text not null,
  attempt_type text not null default 'initial',
  status text not null default 'sent',
  resend_email_id text unique,
  resend_error text,
  subject_snapshot text,
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced_at timestamptz,
  failed_at timestamptz,
  complained_at timestamptz,
  last_event_type text,
  last_event_at timestamptz,
  created_by_email text,
  created_at timestamptz not null default now(),
  constraint b2b_email_send_attempts_attempt_type_check check (
    attempt_type in ('initial', 'manual_resend')
  ),
  constraint b2b_email_send_attempts_status_check check (
    status in ('pending', 'queued', 'processing', 'sent', 'delivered', 'bounced', 'failed', 'complained', 'suppressed', 'skipped')
  )
);

create index if not exists b2b_email_send_attempts_contact_id_idx
on public.b2b_email_send_attempts (contact_id, created_at desc);

create index if not exists b2b_email_send_attempts_campaign_recipient_id_idx
on public.b2b_email_send_attempts (campaign_recipient_id);

create index if not exists b2b_email_send_attempts_campaign_id_idx
on public.b2b_email_send_attempts (campaign_id);

create index if not exists b2b_email_send_attempts_resend_email_id_idx
on public.b2b_email_send_attempts (resend_email_id)
where resend_email_id is not null;

alter table public.b2b_email_send_attempts enable row level security;

grant select, insert, update, delete on table public.b2b_email_send_attempts to service_role;
