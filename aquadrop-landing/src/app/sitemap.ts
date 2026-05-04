import { MetadataRoute } from 'next';

import { PRIMARY_ORIGIN } from '@/lib/site';

const routes: Array<{
  path: string;
  lastModified: string;
  changeFrequency: 'weekly' | 'monthly';
  priority: number;
}> = [
  { path: '/', lastModified: '2026-04-22', changeFrequency: 'weekly', priority: 1 },
  { path: '/energiatakarekos-mosas', lastModified: '2026-04-23', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/mosokapszula-hasznalata', lastModified: '2026-04-22', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/mosokapszula-nem-oldodik-fel', lastModified: '2026-04-22', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/mosokapszula-vagy-folyekony-mososzer', lastModified: '2026-04-22', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/hogyan-mossunk-20-fokon', lastModified: '2026-04-23', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/mennyit-sporolhatsz-ha-40-helyett-20-fokon-mosol', lastModified: '2026-04-23', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/mosasi-koltseg-kalkulator', lastModified: '2026-04-23', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/adatvedelmi-tajekoztato', lastModified: '2026-04-22', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/suti-tajekoztato', lastModified: '2026-04-22', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/partner', lastModified: '2026-04-22', changeFrequency: 'weekly', priority: 0.7 }
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${PRIMARY_ORIGIN}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
