import { MetadataRoute } from 'next';

import { PRIMARY_ORIGIN } from '@/lib/site';

const basePaths = [
  '/',
  '/energiatakarekos-mosas',
  '/mosokapszula-hasznalata',
  '/mosokapszula-nem-oldodik-fel',
  '/mosokapszula-vagy-folyekony-mososzer',
  '/hogyan-mossunk-20-fokon',
  '/mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol',
  '/adatvedelmi-tajekoztato',
  '/suti-tajekoztato',
  '/partner'
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return basePaths.map((path) => ({
    url: `${PRIMARY_ORIGIN}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
