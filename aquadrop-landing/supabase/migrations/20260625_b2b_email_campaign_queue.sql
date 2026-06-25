alter table public.b2b_email_campaigns
  add column if not exists sending_mode text not null default 'queued',
  add column if not exists per_email_delay_seconds integer not null default 30,
  add column if not exists max_emails_per_process integer not null default 10,
  add column if not exists scheduled_start_at timestamptz,
  add column if not exists queue_started_at timestamptz,
  add column if not exists queue_finished_at timestamptz;

alter table public.b2b_email_campaigns
  drop constraint if exists b2b_email_campaigns_status_check;

alter table public.b2b_email_campaigns
  add constraint b2b_email_campaigns_status_check check (
    status in ('draft', 'ready', 'queued', 'sending', 'sent', 'partial_failed', 'failed', 'cancelled')
  );

alter table public.b2b_email_campaigns
  drop constraint if exists b2b_email_campaigns_sending_mode_check;

alter table public.b2b_email_campaigns
  add constraint b2b_email_campaigns_sending_mode_check check (
    sending_mode in ('queued')
  );

alter table public.b2b_email_campaigns
  drop constraint if exists b2b_email_campaigns_delay_check;

alter table public.b2b_email_campaigns
  add constraint b2b_email_campaigns_delay_check check (
    per_email_delay_seconds >= 0 and per_email_delay_seconds <= 3600
  );

alter table public.b2b_email_campaigns
  drop constraint if exists b2b_email_campaigns_process_limit_check;

alter table public.b2b_email_campaigns
  add constraint b2b_email_campaigns_process_limit_check check (
    max_emails_per_process >= 1 and max_emails_per_process <= 100
  );

alter table public.b2b_email_campaign_recipients
  add column if not exists scheduled_at timestamptz,
  add column if not exists queued_at timestamptz,
  add column if not exists processing_started_at timestamptz,
  add column if not exists attempt_count integer not null default 0,
  add column if not exists next_attempt_at timestamptz,
  add column if not exists locked_at timestamptz,
  add column if not exists locked_by text;

alter table public.b2b_email_campaign_recipients
  drop constraint if exists b2b_email_campaign_recipients_status_check;

alter table public.b2b_email_campaign_recipients
  add constraint b2b_email_campaign_recipients_status_check check (
    status in ('pending', 'queued', 'processing', 'sent', 'delivered', 'bounced', 'failed', 'complained', 'suppressed', 'skipped')
  );

create index if not exists b2b_email_campaign_recipients_queue_idx
on public.b2b_email_campaign_recipients (campaign_id, status, scheduled_at);

create index if not exists b2b_email_campaign_recipients_next_attempt_idx
on public.b2b_email_campaign_recipients (campaign_id, next_attempt_at)
where next_attempt_at is not null;
