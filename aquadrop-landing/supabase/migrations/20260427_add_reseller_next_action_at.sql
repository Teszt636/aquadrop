alter table public.reseller_applications
  add column if not exists next_action_at timestamptz;

update public.reseller_applications
set next_action_at = (next_action_date::timestamp at time zone 'UTC') + interval '9 hours'
where next_action_at is null
  and next_action_date is not null;

update public.reseller_applications
set last_contacted_at = created_at
where last_contacted_at is null;

alter table public.reseller_applications
  alter column last_contacted_at set default now();

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
