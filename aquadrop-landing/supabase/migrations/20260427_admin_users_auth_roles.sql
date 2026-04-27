alter table public.admin_users
  add column if not exists role text not null default 'crm_user',
  add column if not exists password_hash text,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.admin_users
set role = 'crm_user'
where role not in ('admin', 'crm_user');

alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('admin', 'crm_user'));

create or replace function public.set_admin_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_admin_users_updated_at on public.admin_users;
create trigger set_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_admin_users_updated_at();

insert into public.admin_users (name, email, role, is_active)
select 'Aquadrop Admin', 'admin@aquadrop.hu', 'admin', true
where not exists (
  select 1 from public.admin_users where lower(email) = 'admin@aquadrop.hu'
);
