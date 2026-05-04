create table if not exists public.gift_inbound_emails (
  id uuid primary key default gen_random_uuid(),
  resend_email_id text unique,
  gift_claim_id uuid references public.gift_claims(id) on delete set null,
  from_email text,
  subject text,
  body_preview text,
  has_attachments boolean not null default false,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists gift_inbound_emails_claim_idx
  on public.gift_inbound_emails (gift_claim_id, processed_at desc);
