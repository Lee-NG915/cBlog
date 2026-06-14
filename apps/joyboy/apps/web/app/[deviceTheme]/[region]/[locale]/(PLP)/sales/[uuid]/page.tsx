import { ProductListingPage } from '@castlery/modules-search-components/server';
import { notFound, redirect } from 'next/navigation';
import { sbApiClient } from '@castlery/modules-cms-components';
import { createMetadata } from '@castlery/seo';
import { EcEnv } from '@castlery/config';
import { logger, setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { PlpSalePageClient } from './page-client';
import { isOutdated } from '@castlery/modules-cms-services';
import { cache } from 'react';
import { CategoryDyTagServer } from '@castlery/modules-composite-components';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { uuid: string } }) {
  const salePageData = await getSalePageDataByUuid(params.uuid);
  if (!salePageData) {
    return {
      title: 'Sale Page Not Found',
      description: 'The sale page you are looking for does not exist.',
    };
  }
  return await createMetadata({
    title: salePageData.name,
    description: salePageData.description,
    keywords: salePageData.keywords,
    canonicalUrl: `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${
      salePageData.path
    }`,
    notIndexed: false,
    largeImagePreview: true,
    robots: {
      index: true,
      'max-image-preview': 'large',
    },
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { uuid: string };
  searchParams: { dyApiPreview?: string };
}) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.PLP, domain: BUSINESS_DOMAIN.SEARCH });
  const salePageData = await getSalePageDataByUuid(params.uuid);
  if (!salePageData) {
    return notFound();
  }
  if (
    salePageData?.published_at &&
    salePageData?.ended_at &&
    isOutdated(salePageData.published_at, salePageData.ended_at) &&
    salePageData.path !== '/sale'
  ) {
    return redirect(`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/sale`);
  }

  return (
    <>
      <PlpSalePageClient breadcrumb={salePageData.name} uuid={params.uuid} />
      <CategoryDyTagServer breadcrumbNames={[salePageData.name]} />
      <ProductListingPage salePageData={salePageData} dyApiPreview={searchParams.dyApiPreview} />
    </>
  );
}

// ✅ 使用 cache() 避免在 generateMetadata 和 Page 中重复调用
// Next.js 会在同一个请求中缓存这个函数的结果
const getSalePageDataByUuid = cache(async (uuid: string) => {
  const { data, error } = await sbApiClient.getRawSalePages();
  if (error) {
    logger.error('Failed to fetch sale pages data', { error, uuid });
    return;
  }
  const salePageData = data?.find((item) => item._uid === uuid);
  return salePageData;
});
