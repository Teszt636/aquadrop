alter table public.gift_claims
add column if not exists receipt_url text;

alter table public.gift_claims
add column if not exists receipt_path text;
