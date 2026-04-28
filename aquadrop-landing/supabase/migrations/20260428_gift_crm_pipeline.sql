alter table public.gift_claims
  add column if not exists pipeline_status text not null default 'Új igénylés',
  add column if not exists assigned_to uuid references public.admin_users(id) on delete set null,
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

update public.gift_claims
set next_action_at = (
  date_trunc('day', created_at at time zone 'UTC')
  + interval '1 day'
  + make_interval(hours => 10)
) at time zone 'UTC'
where next_action_at is null;

update public.gift_claims
set next_action_description = 'Ellenőrizd a feltöltött blokkot, a vásárlás adatait és az igénylés jogosultságát.'
where next_action_description is null;

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

create index if not exists gift_claims_next_action_idx
  on public.gift_claims (next_action_at asc nulls last);

create index if not exists gift_claims_assigned_to_idx
  on public.gift_claims (assigned_to);

create index if not exists gift_claims_pipeline_status_idx
  on public.gift_claims (pipeline_status);

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

drop trigger if exists set_gift_claims_updated_at on public.gift_claims;
create trigger set_gift_claims_updated_at
before update on public.gift_claims
for each row execute function public.set_updated_at_column();
