-- Harden RLS for public form tables while keeping anon INSERT.
-- Admin access continues through service_role server-side API routes.

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
    execute format('alter table public.%I enable row level security;', t);

    -- Normalize anon INSERT policy name/content (idempotent)
    execute format('drop policy if exists "Allow public insert" on public.%I;', t);
    execute format('drop policy if exists "anon_insert" on public.%I;', t);
    execute format(
      'create policy "anon_insert" on public.%I for insert to anon with check (true);',
      t
    );

    -- Remove explicit deny policies; default RLS deny already blocks anon SELECT/UPDATE/DELETE
    execute format('drop policy if exists "Deny public select" on public.%I;', t);
    execute format('drop policy if exists "Deny public update" on public.%I;', t);
    execute format('drop policy if exists "Deny public delete" on public.%I;', t);
    execute format('drop policy if exists "anon_select" on public.%I;', t);
    execute format('drop policy if exists "anon_update" on public.%I;', t);
    execute format('drop policy if exists "anon_delete" on public.%I;', t);
  end loop;
end
$$;

-- Remove truly duplicate indexes only on selected tables.
-- Safety rules:
-- - never remove PK indexes
-- - never remove indexes backing any constraint (UNIQUE / EXCLUDE / etc.)
-- - keep one index per identical definition

do $$
declare
  rec record;
begin
  for rec in
    with idx as (
      select
        n.nspname as schemaname,
        t.relname as tablename,
        i.indexrelid,
        ic.relname as indexname,
        i.indisprimary,
        pg_get_expr(i.indpred, i.indrelid) as pred_expr,
        pg_get_expr(i.indexprs, i.indrelid) as key_expr,
        i.indkey,
        am.amname as access_method,
        pg_get_indexdef(i.indexrelid) as indexdef,
        exists (
          select 1
          from pg_constraint c
          where c.conindid = i.indexrelid
        ) as is_constraint_backing
      from pg_index i
      join pg_class t on t.oid = i.indrelid
      join pg_namespace n on n.oid = t.relnamespace
      join pg_class ic on ic.oid = i.indexrelid
      join pg_am am on am.oid = ic.relam
      where n.nspname = 'public'
        and t.relname in ('announcement_signups', 'gift_claims', 'reseller_applications')
    ),
    candidates as (
      select
        *,
        row_number() over (
          partition by
            schemaname,
            tablename,
            indisprimary,
            is_constraint_backing,
            access_method,
            indkey,
            coalesce(key_expr, ''),
            coalesce(pred_expr, '')
          order by indexname
        ) as rn,
        count(*) over (
          partition by
            schemaname,
            tablename,
            indisprimary,
            is_constraint_backing,
            access_method,
            indkey,
            coalesce(key_expr, ''),
            coalesce(pred_expr, '')
        ) as cnt
      from idx
      where not indisprimary
        and not is_constraint_backing
    )
    select *
    from candidates
    where cnt > 1
      and rn > 1
  loop
    execute format('drop index if exists %I.%I;', rec.schemaname, rec.indexname);
  end loop;
end
$$;

-- NOTE (no-op by design): unused indexes are intentionally NOT dropped in this migration.
