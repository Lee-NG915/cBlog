import { EcEnv } from '@castlery/config';
import type { MetadataRoute } from 'next';

/**
 * @see https://github.com/search?q=path%3Aapp%2Frobots.ts&type=code
 * @see https://robotstxt.org/robotstxt.html
 * @see https://rotecna.com/robots.txt
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${EcEnv.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  };
}
