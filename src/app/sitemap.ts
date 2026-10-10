import { MetadataRoute } from 'next';
import { INITIAL_RESOURCES, INITIAL_SUBJECTS, INITIAL_CREATORS } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://syllabi.app';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/subjects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/requests`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/copyright`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/safety`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const resourceRoutes: MetadataRoute.Sitemap = INITIAL_RESOURCES.map((r) => ({
    url: `${baseUrl}/resource/${r.slug}`,
    lastModified: new Date(r.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const creatorRoutes: MetadataRoute.Sitemap = INITIAL_CREATORS.map((c) => ({
    url: `${baseUrl}/creator/${c.username}`,
    lastModified: new Date(c.createdAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...resourceRoutes, ...creatorRoutes];
}
