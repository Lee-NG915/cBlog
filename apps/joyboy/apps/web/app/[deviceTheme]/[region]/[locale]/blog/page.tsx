import { sbApiClient } from '@castlery/modules-cms-components';
import React from 'react';
import { PageClient, BlogList } from './page.client';
import { Blog, JsonLd, WithContext } from '@castlery/seo';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export { generateMetadata } from './metadata';

export const revalidate = 600;

export default async function BlogPage() {
  setGlobalSentryContext({ pageType: PAGE_TYPES.BLOG, domain: BUSINESS_DOMAIN.CMS });

  const blogList = await sbApiClient.getBlogPosts();

  const jsonLd: WithContext<Blog> = {
    '@type': 'Blog',
    '@context': 'https://schema.org',
  };
  return (
    <>
      <PageClient />
      <JsonLd code={jsonLd} />
      <BlogList blogList={blogList} />
    </>
  );
}
