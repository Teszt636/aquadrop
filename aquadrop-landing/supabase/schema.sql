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

create index if not exists gift_claims_email_idx
  on public.gift_claims (email);

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

alter table public.reseller_applications
  add column if not exists pipeline_status text not null default 'Új lead',
  add column if not exists assigned_to text,
  add column if not exists admin_note text,
  add column if not exists next_action_date date,
  add column if not exists last_contacted_at timestamptz,
  add column if not exists lead_score integer not null default 0,
  add column if not exists is_hot_lead boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

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
