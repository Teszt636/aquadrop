-- Public form inserts now go through server-side APIs with service role.
-- Remove anon INSERT policies from public form tables.

do $$
declare
  t text;
begin
  foreach t in array array[
    'announcement_signups',
    'gift_claims',
    'media_kit_downloads',
    'reseller_applications'
  ]
  loop
    execute format('drop policy if exists "anon_insert" on public.%I;', t);
    execute format('drop policy if exists "Allow public insert" on public.%I;', t);
  end loop;
end
$$;
