create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique
);

alter table public.reseller_applications
  add column if not exists next_action_description text,
  add column if not exists previous_contacted_at timestamptz;

alter table public.reseller_applications
  add column if not exists assigned_to_v2 uuid references public.admin_users(id) on delete set null;

update public.reseller_applications
set assigned_to_v2 = null
where assigned_to_v2 is null;

alter table public.reseller_applications
  drop column if exists assigned_to;

alter table public.reseller_applications
  rename column assigned_to_v2 to assigned_to;

update public.reseller_applications
set next_action_description = 'A mai napon ellenőrizd a jelentkezőt és vedd fel vele a kapcsolatot a viszonteladói értékesítéssel kapcsolatban.'
where next_action_description is null;

update public.reseller_applications
set previous_contacted_at = null
where previous_contacted_at is not null;

update public.reseller_applications
set next_action_at = coalesce(next_action_at, (date_trunc('day', created_at at time zone 'UTC') + interval '1 day' + interval '10 hours') at time zone 'UTC')
where next_action_at is null;
