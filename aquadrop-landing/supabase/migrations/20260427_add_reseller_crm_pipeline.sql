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
for each row
execute function public.set_updated_at_column();
