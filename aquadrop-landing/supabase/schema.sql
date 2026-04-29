-- Aquadrop Supabase schema
-- Copy-paste ready for the Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.announcement_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  consent boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists announcement_signups_email_idx
  on public.announcement_signups (email);

create table if not exists public.gift_claims (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  shipping_address text not null,
  purchase_location text not null,
  purchase_date date not null,
  receipt_url text,
  receipt_path text,
  receipt_file_url text,
  consent boolean not null default false,
  purchase_declaration boolean not null default false,
  status text not null default 'Új' check (status in ('Új', 'Feldolgozás alatt', 'Kész', 'Elutasítva')),
  admin_note text,
  status_token text not null unique default gen_random_uuid()::text,
  status_token_created_at timestamptz not null default now(),
  created_at timestamptz default now()
);

alter table public.gift_claims
add column if not exists receipt_url text;

alter table public.gift_claims
add column if not exists receipt_path text;

update public.gift_claims
set status = 'Új'
where status = 'uj';

alter table public.gift_claims
alter column status set default 'Új';

alter table public.gift_claims
drop constraint if exists gift_claims_status_check;

alter table public.gift_claims
add constraint gift_claims_status_check
check (status in ('Új', 'Feldolgozás alatt', 'Kész', 'Elutasítva'));

alter table public.gift_claims
  add column if not exists pipeline_status text not null default 'Új igénylés',
  add column if not exists next_action_at timestamptz,
  add column if not exists next_action_description text,
  add column if not exists last_contacted_at timestamptz,
  add column if not exists previous_contacted_at timestamptz,
  add column if not exists receipt_check_status text not null default 'Ellenőrzésre vár',
  add column if not exists receipt_check_note text,
  add column if not exists receipt_is_valid boolean,
  add column if not exists purchase_eligible boolean,
  add column if not exists shipping_status text not null default 'Nincs előkészítve',
  add column if not exists courier_name text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists review_request_sent_at timestamptz,
  add column if not exists review_request_email_status text,
  add column if not exists ai_check_status text not null default 'Nincs ellenőrizve',
  add column if not exists ai_check_result jsonb,
  add column if not exists ai_confidence numeric,
  add column if not exists updated_at timestamptz not null default now();

update public.gift_claims
set pipeline_status = case
  when status = 'Új' then 'Új igénylés'
  when status = 'Feldolgozás alatt' then 'Blokk ellenőrzés alatt'
  when status = 'Kész' then 'Lezárva'
  when status = 'Elutasítva' then 'Elutasítva'
  else coalesce(nullif(pipeline_status, ''), 'Új igénylés')
end;

alter table public.gift_claims
drop constraint if exists gift_claims_pipeline_status_check;

alter table public.gift_claims
add constraint gift_claims_pipeline_status_check
check (
  pipeline_status in (
    'Új igénylés',
    'Blokk ellenőrzés alatt',
    'Hiánypótlás szükséges',
    'Jóváhagyva',
    'Csomagolás alatt',
    'Futárnak átadva',
    'Kézbesítve',
    'Elutasítva',
    'Lezárva'
  )
);

alter table public.gift_claims
drop constraint if exists gift_claims_receipt_check_status_check;

alter table public.gift_claims
add constraint gift_claims_receipt_check_status_check
check (
  receipt_check_status in (
    'Ellenőrzésre vár',
    'Érvényes blokk',
    'Nem olvasható',
    'Nem megfelelő termék',
    'Duplikált blokk gyanú',
    'Elutasítva'
  )
);

alter table public.gift_claims
drop constraint if exists gift_claims_shipping_status_check;

alter table public.gift_claims
add constraint gift_claims_shipping_status_check
check (
  shipping_status in (
    'Nincs előkészítve',
    'Csomagolásra vár',
    'Csomagolva',
    'Futárnak átadva',
    'Kézbesítve',
    'Sikertelen kézbesítés'
  )
);

alter table public.gift_claims
drop constraint if exists gift_claims_ai_check_status_check;

alter table public.gift_claims
add constraint gift_claims_ai_check_status_check
check (
  ai_check_status in (
    'Nincs ellenőrizve',
    'Ellenőrzés alatt',
    'Elfogadva',
    'Gyanús',
    'Hibás',
    'Kézi ellenőrzés szükséges'
  )
);

create index if not exists gift_claims_email_idx
  on public.gift_claims (email);

create unique index if not exists gift_claims_status_token_key
  on public.gift_claims (status_token);

create index if not exists gift_claims_next_action_idx
  on public.gift_claims (next_action_at asc nulls last);

create index if not exists gift_claims_assigned_to_idx
  on public.gift_claims (assigned_to);

create index if not exists gift_claims_pipeline_status_idx
  on public.gift_claims (pipeline_status);

create table if not exists public.reseller_applications (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  website text,
  sales_channel text not null,
  message text,
  created_at timestamptz default now()
);

create index if not exists reseller_applications_email_idx
  on public.reseller_applications (email);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null default 'crm_user' check (role in ('admin', 'crm_user')),
  password_hash text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gift_claims
  add column if not exists assigned_to uuid references public.admin_users(id) on delete set null;

alter table public.reseller_applications
  add column if not exists pipeline_status text not null default 'Új lead',
  add column if not exists assigned_to uuid references public.admin_users(id) on delete set null,
  add column if not exists next_action_description text,
  add column if not exists next_action_date date,
  add column if not exists last_contacted_at timestamptz,
  add column if not exists previous_contacted_at timestamptz,
  add column if not exists lead_score integer not null default 0,
  add column if not exists is_hot_lead boolean not null default false,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists next_action_at timestamptz;

alter table public.reseller_applications
drop constraint if exists reseller_applications_pipeline_status_check;

alter table public.reseller_applications
add constraint reseller_applications_pipeline_status_check
check (
  pipeline_status in (
    'Új lead',
    'Felhívandó',
    'Tárgyalásban',
    'Mintát küldeni',
    'Szerződés előtt',
    'Partner lett',
    'Elutasítva'
  )
);

alter table public.reseller_applications
drop constraint if exists reseller_applications_lead_score_check;

alter table public.reseller_applications
add constraint reseller_applications_lead_score_check
check (lead_score between 0 and 100);

alter table public.reseller_applications
  drop constraint if exists reseller_applications_next_action_at_time_check;

alter table public.reseller_applications
  add constraint reseller_applications_next_action_at_time_check
  check (
    next_action_at is null
    or (
      extract(hour from next_action_at at time zone 'UTC') between 6 and 20
      and extract(minute from next_action_at at time zone 'UTC') in (0, 15, 30, 45)
      and extract(second from next_action_at at time zone 'UTC') = 0
    )
  );

create or replace function public.set_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_reseller_applications_updated_at on public.reseller_applications;
create trigger set_reseller_applications_updated_at
before update on public.reseller_applications
for each row execute function public.set_updated_at_column();

drop trigger if exists set_gift_claims_updated_at on public.gift_claims;
create trigger set_gift_claims_updated_at
before update on public.gift_claims
for each row execute function public.set_updated_at_column();

create table if not exists public.gift_activity_logs (
  id uuid primary key default gen_random_uuid(),
  gift_claim_id uuid not null references public.gift_claims(id) on delete cascade,
  changed_by_user_id uuid references public.admin_users(id) on delete set null,
  changed_by_name text,
  changed_by_email text,
  field_name text not null,
  old_value text,
  new_value text,
  change_summary text,
  created_at timestamptz not null default now()
);

create index if not exists gift_activity_logs_claim_idx
  on public.gift_activity_logs (gift_claim_id, created_at desc);

create table if not exists public.media_kit_downloads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  usage_type text not null,
  downloaded_file text,
  created_at timestamptz default now()
);

create index if not exists media_kit_downloads_email_idx
  on public.media_kit_downloads (email);

alter table public.announcement_signups enable row level security;
alter table public.gift_claims enable row level security;
alter table public.media_kit_downloads enable row level security;
alter table public.reseller_applications enable row level security;

do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'announcement_signups',
    'gift_claims',
    'media_kit_downloads',
    'reseller_applications'
  ]
  loop
    for policy_name in
      select pol.policyname
      from pg_policies pol
      where pol.schemaname = 'public'
        and pol.tablename = table_name
        and pol.qual = 'true'
    loop
      execute format('drop policy if exists %I on public.%I;', policy_name, table_name);
    end loop;
  end loop;
end
$$;

drop policy if exists "Allow public insert" on public.announcement_signups;
drop policy if exists "Deny public select" on public.announcement_signups;
drop policy if exists "Deny public update" on public.announcement_signups;
drop policy if exists "Deny public delete" on public.announcement_signups;

create policy "Allow public insert"
on public.announcement_signups
for insert
to anon
with check (true);

create policy "Deny public select"
on public.announcement_signups
for select
to anon
using (false);

create policy "Deny public update"
on public.announcement_signups
for update
to anon
using (false);

create policy "Deny public delete"
on public.announcement_signups
for delete
to anon
using (false);

drop policy if exists "Allow public insert" on public.gift_claims;
drop policy if exists "Deny public select" on public.gift_claims;
drop policy if exists "Deny public update" on public.gift_claims;
drop policy if exists "Deny public delete" on public.gift_claims;

create policy "Allow public insert"
on public.gift_claims
for insert
to anon
with check (true);

create policy "Deny public select"
on public.gift_claims
for select
to anon
using (false);

create policy "Deny public update"
on public.gift_claims
for update
to anon
using (false);

create policy "Deny public delete"
on public.gift_claims
for delete
to anon
using (false);

drop policy if exists "Allow public insert" on public.media_kit_downloads;
drop policy if exists "Deny public select" on public.media_kit_downloads;
drop policy if exists "Deny public update" on public.media_kit_downloads;
drop policy if exists "Deny public delete" on public.media_kit_downloads;

create policy "Allow public insert"
on public.media_kit_downloads
for insert
to anon
with check (true);

create policy "Deny public select"
on public.media_kit_downloads
for select
to anon
using (false);

create policy "Deny public update"
on public.media_kit_downloads
for update
to anon
using (false);

create policy "Deny public delete"
on public.media_kit_downloads
for delete
to anon
using (false);

drop policy if exists "Allow public insert" on public.reseller_applications;
drop policy if exists "Deny public select" on public.reseller_applications;
drop policy if exists "Deny public update" on public.reseller_applications;
drop policy if exists "Deny public delete" on public.reseller_applications;

create policy "Allow public insert"
on public.reseller_applications
for insert
to anon
with check (true);

create policy "Deny public select"
on public.reseller_applications
for select
to anon
using (false);

create policy "Deny public update"
on public.reseller_applications
for update
to anon
using (false);

create policy "Deny public delete"
on public.reseller_applications
for delete
to anon
using (false);

alter table public.reseller_applications
  add column if not exists daily_task_email_sent_at timestamptz,
  add column if not exists reminder_1h_email_sent_at timestamptz;

create table if not exists public.crm_email_notifications (
  id uuid primary key default gen_random_uuid(),
  notification_type text not null check (notification_type in ('partner_daily_tasks', 'partner_1h_reminder')),
  crm_type text not null default 'partner',
  recipient_user_id uuid references public.admin_users(id) on delete set null,
  recipient_email text not null,
  reseller_application_id uuid references public.reseller_applications(id) on delete set null,
  notification_date date,
  next_action_at_snapshot timestamptz,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
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
