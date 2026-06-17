create table if not exists public.seo_articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz null,
  status text not null default 'draft',
  audience text not null default 'consumer',
  article_goal text not null default 'consumer_product_education',
  category text null,
  title text not null,
  slug text not null,
  excerpt text null,
  seo_title text null,
  meta_description text null,
  body text not null,
  hero_image_url text null,
  hero_image_alt text null,
  primary_keyword text null,
  secondary_keywords text[] not null default '{}',
  manual_related_article_ids uuid[] not null default '{}',
  auto_related_enabled boolean not null default true,
  is_indexable boolean not null default false,
  internal_note text null,
  constraint seo_articles_status_check check (status in ('draft', 'published', 'archived')),
  constraint seo_articles_audience_check check (audience in ('consumer', 'partner')),
  constraint seo_articles_article_goal_check check (
    article_goal in (
      'consumer_product_education',
      'consumer_problem_solution',
      'consumer_energy_saving',
      'consumer_usage_guide',
      'partner_reseller_lead',
      'partner_wholesale_interest',
      'partner_retail_strategy',
      'partner_category_education'
    )
  )
);

create unique index if not exists seo_articles_audience_slug_idx
on public.seo_articles (audience, slug);

create index if not exists seo_articles_status_idx on public.seo_articles (status);
create index if not exists seo_articles_audience_idx on public.seo_articles (audience);
create index if not exists seo_articles_article_goal_idx on public.seo_articles (article_goal);
create index if not exists seo_articles_category_idx on public.seo_articles (category);
create index if not exists seo_articles_published_at_desc_idx on public.seo_articles (published_at desc);

create or replace function public.set_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_seo_articles_updated_at on public.seo_articles;
create trigger set_seo_articles_updated_at
before update on public.seo_articles
for each row execute function public.set_updated_at_column();

alter table public.seo_articles enable row level security;

grant select, insert, update, delete
on table public.seo_articles
to service_role;
