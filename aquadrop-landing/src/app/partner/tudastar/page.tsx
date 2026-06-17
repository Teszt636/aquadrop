import type { Metadata } from 'next';

import { SeoArticleListPage } from '@/components/seo-articles/SeoArticleViews';
import { getPublishedSeoArticles } from '@/lib/articles/seo-articles';
import { SITE_URL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Viszonteladói tudástár | Aquadrop partner cikkek',
  description: 'Hasznos Aquadrop cikkek üzleteknek, webshopoknak és beszerzőknek a prémium mosókapszula forgalmazásához.',
  alternates: {
    canonical: `${SITE_URL}/partner/tudastar`
  }
};

export default async function PartnerTudastarPage() {
  const articles = await getPublishedSeoArticles('partner');
  return <SeoArticleListPage audience="partner" articles={articles} />;
}
