import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SeoArticleDetailPage } from '@/components/seo-articles/SeoArticleViews';
import {
  buildSeoArticlePath,
  getPublishedSeoArticleBySlug,
  getRelatedSeoArticles
} from '@/lib/articles/seo-articles';
import { SITE_URL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedSeoArticleBySlug('partner', slug);
  if (!article) return {};
  const canonical = `${SITE_URL}${buildSeoArticlePath(article)}`;

  return {
    title: article.seo_title || article.title,
    description: article.meta_description || article.excerpt || article.title,
    alternates: { canonical },
    openGraph: {
      title: article.seo_title || article.title,
      description: article.meta_description || article.excerpt || article.title,
      url: canonical,
      type: 'article',
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
      images: article.hero_image_url ? [{ url: article.hero_image_url, alt: article.hero_image_alt ?? article.title }] : undefined
    }
  };
}

export default async function PartnerTudastarArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getPublishedSeoArticleBySlug('partner', slug);
  if (!article) notFound();
  const relatedArticles = await getRelatedSeoArticles(article);

  return <SeoArticleDetailPage article={article} relatedArticles={relatedArticles} />;
}
