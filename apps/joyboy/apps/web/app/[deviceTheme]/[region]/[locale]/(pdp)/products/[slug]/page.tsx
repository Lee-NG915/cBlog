/* eslint-disable react/jsx-no-undef */
import { Box, Container, Skeleton, Stack } from '@castlery/fortress';
import { ProductFaqListServer, SbWidgets } from '@castlery/modules-cms-components';
import { CMS_PATHS } from '@castlery/modules-cms-domain';
import { uspPreload } from '@castlery/modules-cms-services/server';
import { ProductDyTagServer } from '@castlery/modules-composite-components';
import {
  ProductAddToCart,
  ProductBreadcrumbsServer,
  ProductConfigServer,
  ProductConfigSkeleton,
  ProductDetailsEntryServer,
  ProductDyPromotionServer,
  ProductDyPromotionSkeleton,
  ProductDyRecommendationsServer,
  ProductHeadServer,
  ProductInfoServer,
  ProductRecommendationsServer,
  ProductReduxServer,
  ProductReviews,
  ProductShipping,
  ProductSocialUgc,
  ProductWarranty,
  RefinedProductGallery,
  SofaComfortVideoListServer,
} from '@castlery/modules-product-components';
import { getProductByIdOrSlugThunk } from '@castlery/modules-product-domain';
import { logger, setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { makeStore } from '@castlery/shared-redux-store';
import { sanitizeSlug } from '@castlery/utils';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { PDPStickyColumn } from './components/pdp-sticky-column.client';
import { ProductSchemaServer } from './components/product-schema.server';
import { PDPPageClient } from './page.client';

export { generateMetadata } from './metadata';

async function Page({
  params,
  searchParams,
}: {
  params: { deviceTheme: string; slug: string; region: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  setGlobalSentryContext({
    pageType: PAGE_TYPES.PDP,
    domain: BUSINESS_DOMAIN.PRODUCT,
  });

  const slug = sanitizeSlug(params.slug);
  const searchParamsString =
    Object.keys(searchParams).length > 0
      ? new URLSearchParams(
          Object.fromEntries(
            Object.entries(searchParams)
              .filter(([, value]) => value !== undefined)
              .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
          ) as Record<string, string>
        ).toString()
      : '';
  const finalSlug = searchParamsString ? `${slug}?${searchParamsString}` : slug;
  const persistenceHandles = makePersistenceHandles({
    cookies,
  });
  let cityInfo: any = {};
  try {
    cityInfo = JSON.parse(persistenceHandles?.webCity?.getItem() || '{}');
  } catch (error) {
    logger.error('Failed to parse city info from cookies', { error });
  }
  const store = makeStore();
  const productDataPromise = store
    .dispatch(
      getProductByIdOrSlugThunk({
        idOrSlug: finalSlug,
        cityInfo,
      })
    )
    .unwrap();

  uspPreload({ slug });

  return (
    <Container
      disableGutters
      sx={{
        margin: '0 auto',
      }}
    >
      <PDPPageClient />
      <ProductReduxServer promise={productDataPromise} slug={slug} />
      <ProductDyTagServer promise={productDataPromise} />
      <ProductSchemaServer
        promise={productDataPromise}
        cityInfo={cityInfo}
        searchParams={
          Object.fromEntries(
            Object.entries(searchParams)
              .filter(([, value]) => value !== undefined)
              .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
          ) as { [key: string]: string }
        }
      />
      <Box
        sx={{
          '@media (min-width: 901px)': {
            display: 'grid',
            gridTemplateAreas: "'left right'",
            gridTemplateColumns: {
              md: 'auto 400px',
              lg: 'auto 480px',
              xl: 'auto 560px',
            },
            columnGap: '40px',
            mb: 9,
          },
          '@media (max-width: 1728px) and (min-width: 901px)': {
            pr: '40px',
          },
        }}
      >
        <PDPStickyColumn gridArea="left">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Suspense fallback={<Skeleton />}>
              <RefinedProductGallery promise={productDataPromise} />
            </Suspense>
            <Box
              sx={{
                '@media (max-width: 900px)': {
                  display: 'none',
                },
              }}
            >
              <Suspense fallback={<Skeleton />}>
                <ProductDetailsEntryServer promise={productDataPromise} />
              </Suspense>
            </Box>
          </Box>
        </PDPStickyColumn>
        <PDPStickyColumn gridArea="right">
          <Stack flexDirection="column">
            <ProductBreadcrumbsServer promise={productDataPromise} />
            <Suspense fallback={<Skeleton />}>
              <ProductHeadServer promise={productDataPromise} />
            </Suspense>
            <Suspense fallback={<ProductConfigSkeleton />}>
              <ProductConfigServer slug={slug} promise={productDataPromise} pageType="pdp" />
            </Suspense>
            {/* [保险接入] PDP 保险选 plan UI — CA Guardsman / US Mulberry，位于 Config 与 AddToCart 之间 */}
            <ProductWarranty />
            <Suspense fallback={<ProductDyPromotionSkeleton />}>
              <ProductDyPromotionServer promise={productDataPromise} />
            </Suspense>
            <ProductAddToCart />
            <ProductShipping finalSlug={finalSlug} />
            <ProductInfoServer promise={productDataPromise} pageType="pdp" />
            <Box
              sx={{
                '@media (min-width: 901px)': {
                  display: 'none',
                },
              }}
            >
              <Suspense fallback={<Skeleton />}>
                <ProductDetailsEntryServer promise={productDataPromise} />
              </Suspense>
            </Box>
          </Stack>
        </PDPStickyColumn>
      </Box>
      <SofaComfortVideoListServer slug={slug} />
      <Suspense fallback={<Skeleton />}>
        <SbWidgets widgets={CMS_PATHS.PDP.WIDGETS} {...{ slug }} />
      </Suspense>
      <ProductRecommendationsServer />
      <ProductSocialUgc pageType="pdp" />
      <ProductDyRecommendationsServer />
      <ProductReviews promise={productDataPromise} />
      <ProductFaqListServer />
    </Container>
  );
}

export default Page;
