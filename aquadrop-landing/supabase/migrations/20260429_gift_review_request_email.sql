alter table public.gift_claims
  add column if not exists review_request_sent_at timestamptz,
  add column if not exists review_request_email_status text;
