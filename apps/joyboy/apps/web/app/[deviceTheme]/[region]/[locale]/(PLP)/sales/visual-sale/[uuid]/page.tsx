import { ProductListingPage } from '@castlery/modules-search-components/server';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import { Container, Box } from '@castlery/fortress';
import { sbApiClient } from '@castlery/modules-cms-components';
import { createMetadata } from '@castlery/seo';
import { EcEnv } from '@castlery/config';
import { VisualSalePageStoryblok } from '@castlery/types';
import { PlpVisualSalePageClient } from './page-client';
import { logger, setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { cache } from 'react';
import { CategoryDyTagServer } from '@castlery/modules-composite-components';

export const dynamic = 'force-dynamic';
interface PageProps {
  params: {
    uuid: string;
  };
  searchParams: {
    dyApiPreview?: string;
  };
}

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { content: salePageData, path } = await getCachedSalePageData(params.uuid);

  try {
    const { description, keywords, title, notIndexable } = salePageData?.meta?.[0] || {};
    return await createMetadata({
      title: title || salePageData?.name || 'sale page',
      description,
      keywords,
      canonicalUrl: `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/` + path,
      notIndexed: notIndexable,
    });
  } catch (error) {
    return {
      title: 'Sale Page Not Found',
      description: 'The sale page you are looking for does not exist.',
    };
  }
}

export default async function Page({ params, searchParams }: PageProps) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.PLP, domain: BUSINESS_DOMAIN.SEARCH });
  const { content: salePageData, name, full_slug } = await getCachedSalePageData(params.uuid);
  logger.info('PlpInsights getCachedSalePageData', { name, full_slug });

  if (!salePageData) {
    return notFound();
  }

  return (
    <>
      <PlpVisualSalePageClient breadcrumb={name ?? ''} key={full_slug} />
      <CategoryDyTagServer breadcrumbNames={[name ?? '']} />
      <ProductListingPage
        visualSalePageData={salePageData as unknown as VisualSalePageStoryblok}
        dyApiPreview={searchParams.dyApiPreview}
      />
    </>
  );
}

// ✅ 使用 cache() 避免在 generateMetadata 和 Page 中重复调用
// Next.js 会在同一个请求中缓存这个函数的结果
const getCachedSalePageData = cache(async (uuid: string) => {
  const res = await sbApiClient.getVisualSalePages({
    by_uuids: uuid,
  });
  if (res.length === 0) {
    notFound();
  }
  const specificRes = await sbApiClient.getSpecificPage(res[0].full_slug);
  if (!specificRes) {
    notFound();
  }

  return specificRes;
});
