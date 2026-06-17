import 'server-only';

export type SeoArticleAudience = 'consumer' | 'partner';
export type SeoArticleGoal =
  | 'consumer_product_education'
  | 'consumer_problem_solution'
  | 'consumer_energy_saving'
  | 'consumer_usage_guide'
  | 'partner_reseller_lead'
  | 'partner_wholesale_interest'
  | 'partner_retail_strategy'
  | 'partner_category_education';

export type SeoArticle = {
  id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  status: 'draft' | 'published' | 'archived';
  audience: SeoArticleAudience;
  article_goal: SeoArticleGoal;
  category: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  seo_title: string | null;
  meta_description: string | null;
  body: string;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[];
  manual_related_article_ids: string[];
  auto_related_enabled: boolean;
  is_indexable: boolean;
  internal_note: string | null;
};

export type SeoArticleCta = {
  title: string;
  text: string;
  button: string;
  href: string;
};

const CTA_BY_GOAL: Record<SeoArticleGoal, SeoArticleCta> = {
  consumer_product_education: {
    title: 'Prémium mosókapszulát keresel a mindennapi mosáshoz?',
    text: 'Ismerd meg az Aquadrop Expert Pro 4 az 1-ben mosókapszulát.',
    button: 'Megnézem az Aquadrop Expert Pro-t',
    href: '/'
  },
  consumer_problem_solution: {
    title: 'Praktikus megoldást keresel a mosási problémákra?',
    text: 'Nézd meg, hogyan illeszthető be az Aquadrop Expert Pro a mindennapi mosási rutinba.',
    button: 'Megnézem a mosókapszulát',
    href: '/'
  },
  consumer_energy_saving: {
    title: 'Érdekel az energiatakarékosabb mosási rutin?',
    text: 'Olvass tovább az alacsonyabb hőfokú mosás előnyeiről.',
    button: 'Energiatakarékos mosás',
    href: '/energiatakarekos-mosas'
  },
  consumer_usage_guide: {
    title: 'Biztosan jól használod a mosókapszulát?',
    text: 'Nézd meg a mosókapszula helyes használatáról szóló útmutatót.',
    button: 'Mosókapszula használata',
    href: '/mosokapszula-hasznalata'
  },
  partner_reseller_lead: {
    title: 'Érdekli az Aquadrop Expert Pro viszonteladói lehetőség?',
    text: 'Kérjen partneri információt, és felvesszük Önnel a kapcsolatot.',
    button: 'Viszonteladói kapcsolatfelvétel',
    href: '/partner'
  },
  partner_wholesale_interest: {
    title: 'Prémium mosókapszulát keres nagykereskedelmi vagy viszonteladói célra?',
    text: 'Ismerje meg az Aquadrop Expert Pro partneri lehetőségét.',
    button: 'Partner információ kérése',
    href: '/partner'
  },
  partner_retail_strategy: {
    title: 'Bővítené kínálatát prémium mosókapszulával?',
    text: 'Az Aquadrop Expert Pro jól kommunikálható, hétköznapi használatú háztartási termék.',
    button: 'Megnézem a partneri lehetőséget',
    href: '/partner'
  },
  partner_category_education: {
    title: 'Ismerje meg az Aquadrop partnerprogramot',
    text: 'Hasznos megoldás lehet üzleteknek, webshopoknak és viszonteladóknak.',
    button: 'Aquadrop viszonteladóknak',
    href: '/partner'
  }
};

function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return value.replace(/\/$/, '');
}

function getServiceRoleKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return value;
}

function getHeaders(): HeadersInit {
  const key = getServiceRoleKey();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json'
  };
}

async function fetchSeoArticles(query: URLSearchParams): Promise<SeoArticle[]> {
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/seo_articles?${query.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`SEO article fetch failed: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as SeoArticle[];
}

function addPublishedFilters(query: URLSearchParams) {
  query.set('status', 'eq.published');
  query.set('is_indexable', 'eq.true');
}

export async function getPublishedSeoArticles(audience?: SeoArticleAudience): Promise<SeoArticle[]> {
  const query = new URLSearchParams({
    select: '*',
    order: 'published_at.desc.nullslast,updated_at.desc',
    limit: '200'
  });
  addPublishedFilters(query);
  if (audience) {
    query.set('audience', `eq.${audience}`);
  }

  return fetchSeoArticles(query);
}

export async function getPublishedSeoArticleBySlug(
  audience: SeoArticleAudience,
  slug: string
): Promise<SeoArticle | null> {
  const query = new URLSearchParams({
    select: '*',
    audience: `eq.${audience}`,
    slug: `eq.${slug}`,
    limit: '1'
  });
  addPublishedFilters(query);
  const rows = await fetchSeoArticles(query);
  return rows[0] ?? null;
}

export async function getRelatedSeoArticles(article: SeoArticle, limit = 3): Promise<SeoArticle[]> {
  const allArticles = await getPublishedSeoArticles(article.audience);
  const byId = new Map(allArticles.map((item) => [item.id, item]));
  const related: SeoArticle[] = [];
  const seen = new Set([article.id]);

  for (const id of article.manual_related_article_ids ?? []) {
    const item = byId.get(id);
    if (item && !seen.has(item.id)) {
      related.push(item);
      seen.add(item.id);
    }
    if (related.length >= limit) return related;
  }

  if (article.auto_related_enabled) {
    const candidates = allArticles
      .filter((item) => !seen.has(item.id))
      .sort((left, right) => {
        const leftScore = (left.category && left.category === article.category ? 4 : 0) + (left.article_goal === article.article_goal ? 2 : 0);
        const rightScore = (right.category && right.category === article.category ? 4 : 0) + (right.article_goal === article.article_goal ? 2 : 0);
        if (rightScore !== leftScore) return rightScore - leftScore;
        return new Date(right.published_at ?? right.updated_at).getTime() - new Date(left.published_at ?? left.updated_at).getTime();
      });

    for (const item of candidates) {
      related.push(item);
      seen.add(item.id);
      if (related.length >= limit) return related;
    }
  }

  return related;
}

export function buildSeoArticlePath(article: Pick<SeoArticle, 'audience' | 'slug'>): string {
  return article.audience === 'partner' ? `/partner/tudastar/${article.slug}` : `/tudastar/${article.slug}`;
}

export function getArticleCta(article: Pick<SeoArticle, 'article_goal'>): SeoArticleCta {
  return CTA_BY_GOAL[article.article_goal];
}
