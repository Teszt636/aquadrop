import type { Metadata } from 'next';

import { SeoArticleListPage } from '@/components/seo-articles/SeoArticleViews';
import { getPublishedSeoArticles } from '@/lib/articles/seo-articles';
import { SITE_URL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Aquadrop tudástár | Mosókapszula útmutatók',
  description: 'Gyakorlati Aquadrop tudástár mosókapszula használatról, mosási problémákról és energiatakarékos mosásról.',
  alternates: {
    canonical: `${SITE_URL}/tudastar`
  }
};

export default async function TudastarPage() {
  const articles = await getPublishedSeoArticles('consumer');
  return <SeoArticleListPage audience="consumer" articles={articles} />;
}
