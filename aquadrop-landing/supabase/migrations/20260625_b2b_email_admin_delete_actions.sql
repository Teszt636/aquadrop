alter table public.b2b_email_contacts
  add column if not exists deleted_at timestamptz;

alter table public.b2b_email_groups
  add column if not exists is_active boolean not null default true,
  add column if not exists deleted_at timestamptz;

alter table public.b2b_email_templates
  add column if not exists deleted_at timestamptz;

alter table public.b2b_email_campaigns
  add column if not exists archived_at timestamptz,
  add column if not exists deleted_at timestamptz;

create index if not exists b2b_email_contacts_deleted_at_idx
on public.b2b_email_contacts (deleted_at);

create index if not exists b2b_email_groups_active_deleted_idx
on public.b2b_email_groups (is_active, deleted_at);

create index if not exists b2b_email_templates_active_deleted_idx
on public.b2b_email_templates (is_active, deleted_at);

create index if not exists b2b_email_campaigns_deleted_at_idx
on public.b2b_email_campaigns (deleted_at);
