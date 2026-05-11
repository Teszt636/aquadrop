-- Adds optional source tracking for article newsletter signups.
-- Run in the Supabase SQL Editor before relying on source analytics.

alter table public.announcement_signups
add column if not exists source text;
