create table if not exists public.reseller_activity_logs (
  id uuid primary key default gen_random_uuid(),
  reseller_application_id uuid not null references public.reseller_applications(id) on delete cascade,
  changed_by_user_id uuid null references public.admin_users(id) on delete set null,
  changed_by_name text null,
  changed_by_email text null,
  field_name text not null,
  old_value text null,
  new_value text null,
  change_summary text null,
  created_at timestamptz not null default now()
);

create index if not exists reseller_activity_logs_reseller_idx
  on public.reseller_activity_logs (reseller_application_id, created_at desc);
