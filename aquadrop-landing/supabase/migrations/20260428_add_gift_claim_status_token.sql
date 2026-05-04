alter table public.gift_claims
  add column if not exists status_token text,
  add column if not exists status_token_created_at timestamptz default now();

update public.gift_claims
set
  status_token = coalesce(status_token, gen_random_uuid()::text),
  status_token_created_at = coalesce(status_token_created_at, created_at, now())
where status_token is null
   or status_token_created_at is null;

create unique index if not exists gift_claims_status_token_key
  on public.gift_claims (status_token);

alter table public.gift_claims
  alter column status_token set not null;
