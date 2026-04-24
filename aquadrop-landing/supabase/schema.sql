-- Aquadrop Supabase schema
-- Copy-paste ready for the Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.announcement_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  consent boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists announcement_signups_email_idx
  on public.announcement_signups (email);

create table if not exists public.gift_claims (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  shipping_address text not null,
  purchase_location text not null,
  purchase_date date not null,
  receipt_file_url text,
  consent boolean not null default false,
  purchase_declaration boolean not null default false,
  status text not null default 'uj',
  admin_note text,
  created_at timestamptz default now()
);

create index if not exists gift_claims_email_idx
  on public.gift_claims (email);

create table if not exists public.reseller_applications (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  website text,
  sales_channel text not null,
  message text,
  created_at timestamptz default now()
);

create index if not exists reseller_applications_email_idx
  on public.reseller_applications (email);

create table if not exists public.media_kit_downloads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  usage_type text not null,
  created_at timestamptz default now()
);

create index if not exists media_kit_downloads_email_idx
  on public.media_kit_downloads (email);
