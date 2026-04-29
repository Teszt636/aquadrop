alter table public.gift_inbound_emails
  add column if not exists reason text,
  add column if not exists matched boolean not null default false;
