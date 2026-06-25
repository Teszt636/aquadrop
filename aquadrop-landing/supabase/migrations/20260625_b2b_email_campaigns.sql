create table if not exists public.b2b_email_contacts (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text not null,
  phone text,
  website text,
  source text,
  legal_basis text,
  note text,
  is_active boolean not null default true,
  unsubscribed_at timestamptz,
  bounced_at timestamptz,
  complained_at timestamptz,
  suppressed_at timestamptz,
  last_email_status text,
  last_email_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists b2b_email_contacts_lower_email_idx
on public.b2b_email_contacts (lower(email));

create table if not exists public.b2b_email_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.b2b_email_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.b2b_email_groups(id) on delete cascade,
  contact_id uuid references public.b2b_email_contacts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint b2b_email_group_members_unique unique (group_id, contact_id)
);

create index if not exists b2b_email_group_members_group_id_idx
on public.b2b_email_group_members (group_id);

create index if not exists b2b_email_group_members_contact_id_idx
on public.b2b_email_group_members (contact_id);

create table if not exists public.b2b_email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  preheader text,
  html_body text not null,
  text_body text,
  cta_label text,
  cta_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.b2b_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  template_id uuid references public.b2b_email_templates(id) on delete set null,
  status text not null default 'draft',
  subject_snapshot text,
  html_snapshot text,
  text_snapshot text,
  target_count integer not null default 0,
  sent_count integer not null default 0,
  delivered_count integer not null default 0,
  bounced_count integer not null default 0,
  failed_count integer not null default 0,
  complained_count integer not null default 0,
  suppressed_count integer not null default 0,
  created_by_email text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint b2b_email_campaigns_status_check check (
    status in ('draft', 'ready', 'sending', 'sent', 'partial_failed', 'failed', 'cancelled')
  )
);

create index if not exists b2b_email_campaigns_status_idx
on public.b2b_email_campaigns (status);

create table if not exists public.b2b_email_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.b2b_email_campaigns(id) on delete cascade,
  contact_id uuid references public.b2b_email_contacts(id) on delete set null,
  email text not null,
  company_name text,
  contact_name text,
  status text not null default 'pending',
  resend_email_id text,
  resend_error text,
  last_event_type text,
  last_event_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  bounced_at timestamptz,
  failed_at timestamptz,
  complained_at timestamptz,
  created_at timestamptz not null default now(),
  constraint b2b_email_campaign_recipients_status_check check (
    status in ('pending', 'sent', 'delivered', 'bounced', 'failed', 'complained', 'suppressed', 'skipped')
  )
);

create index if not exists b2b_email_campaign_recipients_campaign_id_idx
on public.b2b_email_campaign_recipients (campaign_id);

create unique index if not exists b2b_email_campaign_recipients_resend_email_id_idx
on public.b2b_email_campaign_recipients (resend_email_id)
where resend_email_id is not null;

create index if not exists b2b_email_campaign_recipients_email_idx
on public.b2b_email_campaign_recipients (email);

create unique index if not exists b2b_email_campaign_recipients_campaign_contact_idx
on public.b2b_email_campaign_recipients (campaign_id, contact_id)
where contact_id is not null;

create table if not exists public.b2b_email_events (
  id uuid primary key default gen_random_uuid(),
  svix_id text unique,
  resend_email_id text,
  event_type text not null,
  recipient_email text,
  campaign_recipient_id uuid references public.b2b_email_campaign_recipients(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists b2b_email_events_resend_email_id_idx
on public.b2b_email_events (resend_email_id);

create or replace function public.set_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_b2b_email_contacts_updated_at on public.b2b_email_contacts;
create trigger set_b2b_email_contacts_updated_at
before update on public.b2b_email_contacts
for each row execute function public.set_updated_at_column();

drop trigger if exists set_b2b_email_groups_updated_at on public.b2b_email_groups;
create trigger set_b2b_email_groups_updated_at
before update on public.b2b_email_groups
for each row execute function public.set_updated_at_column();

drop trigger if exists set_b2b_email_templates_updated_at on public.b2b_email_templates;
create trigger set_b2b_email_templates_updated_at
before update on public.b2b_email_templates
for each row execute function public.set_updated_at_column();

drop trigger if exists set_b2b_email_campaigns_updated_at on public.b2b_email_campaigns;
create trigger set_b2b_email_campaigns_updated_at
before update on public.b2b_email_campaigns
for each row execute function public.set_updated_at_column();

alter table public.b2b_email_contacts enable row level security;
alter table public.b2b_email_groups enable row level security;
alter table public.b2b_email_group_members enable row level security;
alter table public.b2b_email_templates enable row level security;
alter table public.b2b_email_campaigns enable row level security;
alter table public.b2b_email_campaign_recipients enable row level security;
alter table public.b2b_email_events enable row level security;

grant select, insert, update, delete on table public.b2b_email_contacts to service_role;
grant select, insert, update, delete on table public.b2b_email_groups to service_role;
grant select, insert, update, delete on table public.b2b_email_group_members to service_role;
grant select, insert, update, delete on table public.b2b_email_templates to service_role;
grant select, insert, update, delete on table public.b2b_email_campaigns to service_role;
grant select, insert, update, delete on table public.b2b_email_campaign_recipients to service_role;
grant select, insert, update, delete on table public.b2b_email_events to service_role;

insert into public.b2b_email_templates (
  name,
  subject,
  preheader,
  html_body,
  text_body,
  cta_label,
  cta_url,
  is_active
)
select
  'Nagykereskedelmi első kapcsolatfelvétel',
  'Aquadrop Expert Pro - nagykereskedelmi együttműködési lehetőség',
  'Rövid B2B bemutatkozás viszonteladói és nagykereskedelmi partnereknek.',
  '<p>Tisztelt {{contact_name}}!</p><p>Szeretném röviden bemutatni az Aquadrop Expert Pro 4 az 1-ben mosókapszulát, amelynek hivatalos termékbevezetése 2026. szeptember 1-jén indul.</p><p>A termék prémium pozicionálású, modern háztartási mosási igényekre fejlesztett mosókapszula. A bevezetéshez viszonteladói és nagykereskedelmi partnereket keresünk, különösen olyan szereplőket, akik nyitottak új, jól kommunikálható mosási termék felvételére.</p><p>Az első forgalmazók az augusztus végétől induló marketing kommunikációban is megjelenési lehetőséget kaphatnak.</p><p>Amennyiben releváns lehet Önöknek az Aquadrop Expert Pro forgalmazása, szívesen küldök rövid termékismertetőt és partneri feltételeket.</p><p>Üdvözlettel:<br>Aquadrop Expert Pro<br>hello@aquadrop.hu</p><p>Leiratkozás / további megkeresés leállítása:<br>{{unsubscribe_url}}</p>',
  'Tisztelt {{contact_name}}!\n\nSzeretném röviden bemutatni az Aquadrop Expert Pro 4 az 1-ben mosókapszulát, amelynek hivatalos termékbevezetése 2026. szeptember 1-jén indul.\n\nA termék prémium pozicionálású, modern háztartási mosási igényekre fejlesztett mosókapszula. A bevezetéshez viszonteladói és nagykereskedelmi partnereket keresünk, különösen olyan szereplőket, akik nyitottak új, jól kommunikálható mosási termék felvételére.\n\nAz első forgalmazók az augusztus végétől induló marketing kommunikációban is megjelenési lehetőséget kaphatnak.\n\nAmennyiben releváns lehet Önöknek az Aquadrop Expert Pro forgalmazása, szívesen küldök rövid termékismertetőt és partneri feltételeket.\n\nÜdvözlettel:\nAquadrop Expert Pro\nhello@aquadrop.hu\n\nLeiratkozás / további megkeresés leállítása:\n{{unsubscribe_url}}',
  null,
  null,
  true
where not exists (
  select 1
  from public.b2b_email_templates
  where name = 'Nagykereskedelmi első kapcsolatfelvétel'
);
