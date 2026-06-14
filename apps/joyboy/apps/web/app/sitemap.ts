import { MetadataRoute } from 'next';

const BASE_URL = 'https://castlery.com';

// TODO @Wcdaren https://www.storyblok.com/tp/how-to-generate-sitemap-headless-cms
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
  ];
}
