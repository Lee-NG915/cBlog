import { CategoryLandingPage } from '@castlery/modules-search-components/server';
import { notFound } from 'next/navigation';
import { getTaxonomiesItem } from '@castlery/modules-cms-domain/server';
import { EcEnv } from '@castlery/config';
import { Metadata } from 'next';
import { createMetadata } from '@castlery/seo';
import { CollectionItem } from '@castlery/types';
import { PlpCollectionPageClient } from './page-client';
import { cache } from 'react';
import { CategoryDyTagServer } from '@castlery/modules-composite-components';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  if (!slug) {
    return {
      title: 'Collection Not Found',
      description: 'The collection you are looking for does not exist.',
    };
  }
  const collectionItem = await getCollectionItem(slug);
  if (!collectionItem) {
    return {
      title: 'Collection Not Found',
      description: 'The collection you are looking for does not exist.',
    };
  }
  return createMetadata({
    title: collectionItem.meta_title,
    description: collectionItem.meta_description,
    keywords: collectionItem.meta_keywords,
    image: collectionItem.thumbnail || undefined,
    canonicalUrl: `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${
      collectionItem.url
    }`,
    notIndexed: false,
    largeImagePreview: true,
    robots: {
      index: true,
      'max-image-preview': 'large',
    },
  });
}

// ✅ 使用 cache() 避免在 generateMetadata 和 Page 中重复调用
// Next.js 会在同一个请求中缓存这个函数的结果
const getCollectionItem = cache(async (slug: string): Promise<CollectionItem | null> => {
  const result = await getTaxonomiesItem(slug);
  return result;
});

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { dyApiPreview?: string };
}) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.PLP, domain: BUSINESS_DOMAIN.SEARCH });
  const slug = params.slug;
  if (!slug) {
    notFound();
  }

  const result = await getCollectionItem(slug);

  if (!result) notFound();

  const breadcrumbsData = [
    {
      name: result.name,
    },
  ];

  return (
    <>
      <PlpCollectionPageClient breadcrumb={breadcrumbsData[0].name} slug={slug} />
      <CategoryDyTagServer breadcrumbNames={[breadcrumbsData[0].name]} />
      <CategoryLandingPage
        categoryItem={result!}
        hideCategoryRefinement={true}
        breadcrumbs={breadcrumbsData}
        queryString={result.query || undefined}
        dyApiPreview={searchParams.dyApiPreview}
      />
    </>
  );
}
