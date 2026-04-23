import { MetadataRoute } from 'next';

const DOMAIN = 'https://www.aquadrop.hu';

const basePaths = [
  '/',
  '/energiatakarekos-mosas',
  '/mosokapszula-hasznalata',
  '/mosokapszula-nem-oldodik-fel',
  '/mosokapszula-vagy-folyekony-mososzer',
  '/adatvedelmi-tajekoztato',
  '/suti-tajekoztato',
  '/partner'
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return basePaths.map((path) => ({
    url: `${DOMAIN}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
