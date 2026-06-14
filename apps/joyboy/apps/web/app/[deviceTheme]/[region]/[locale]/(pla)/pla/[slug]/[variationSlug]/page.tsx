import React from 'react';
import { SbPage, sbApiClient } from '@castlery/modules-cms-components';
import { PageClient } from './page.client';
import { makeStore } from '@castlery/shared-redux-store';
import { getProductByIdOrSlugThunk } from '@castlery/modules-product-domain';
import { EcEnv } from '@castlery/config';
import { experimentDefaultMap } from '../../../../../../../../lib/experiment/experimentConfig';
import { componentKeyMap } from '@castlery/modules-cms-components';
import { fetchKnightApi } from '@castlery/modules-cms-services';
import { CMS_PATHS } from '@castlery/modules-cms-domain';
import { WebMiniCart } from '@castlery/modules-composite-components';
import { logger, setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

// Next.js will invalidate the cache when a new request comes in
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
// The revalidate value is not available when using runtime = 'edge'.
// export const revalidate = 600;

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams
export const dynamicParams = true; // or false, to 404 on unknown paths
// set search params null
// export const dynamic = 'force-static';

export { generateMetadata } from './../metadata';

export default async function Page({ params }: PageProps) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.PDP, domain: BUSINESS_DOMAIN.PRODUCT });
  const store = makeStore();

  const { slug, variationSlug } = params;
  const [productData, sbData, sbPlaBucketData, shopTheLook, originalMenuData] = await Promise.allSettled([
    store
      .dispatch(
        getProductByIdOrSlugThunk({
          idOrSlug: slug,
        })
      )
      .unwrap(),
    sbApiClient.getPlaLayout(variationSlug),
    sbApiClient.getPlaDataBucket(slug),
    sbApiClient.getShopTheLook(),
    fetchKnightApi({ slug: CMS_PATHS.TAXONOMIES.MENU }),
  ]);

  if (productData.status === 'rejected') {
    throw new Error(String(productData.reason));
  }
  if (sbData.status === 'rejected' || !sbData.value?.content) {
    throw new Error(`sbData ${sbData.status || 'empty content'}`);
  }
  if (sbPlaBucketData.status === 'rejected' || !sbPlaBucketData.value?.content) {
    logger.error('Failed to fetch PLA bucket data', { error: sbPlaBucketData.reason, slug });
  }
  if (shopTheLook.status === 'rejected' || !shopTheLook.value?.content) {
    logger.error('Failed to fetch shop the look data', { error: shopTheLook.reason, slug });
  }

  // console.log('productData--------', productData.value.taxons);

  // Since there is no platform to configure some product content, such as USP, etc., CMS is used to configure the data of products under SPU
  // This is not the final solution, but a temporary solution for the PLA experiment
  // So reorganize the data here
  // TODO @abbywang23 Please confirm the final solution with the team, when PLA is officially launched
  const finalSbData = {
    ...sbData.value.content,
    body:
      sbData.value.content.body?.map((item) => {
        let itemData = item;
        if (item.data_source) {
          const selector = item.data_source;
          const data = sbPlaBucketData.status === 'fulfilled' ? sbPlaBucketData.value?.content?.[selector] ?? {} : {};
          itemData.data_source = data;
        }
        if (itemData.component === componentKeyMap.review) {
          // TODO: @lychee27z 在这里处理reviews部分相关cms的逻辑?
        }
        // Add categoryString, collectionString, blogCategoryString fields to the DY recommendation component of pla
        // to meet the DY recommendation strategy
        if (itemData.component === componentKeyMap.dyRecommendationWidgetV2) {
          const productBreadcrumbs = productData.value.breadcrumbs || [];
          const productTaxons = productData.value.taxons || [];
          const breadcrumbs = productBreadcrumbs.filter(
            (item: { level: number }) => item.level === 2 || item.level === 1
          );
          const categoryString = breadcrumbs?.[breadcrumbs.length - 1]?.name;
          const blogCategoryString = productBreadcrumbs.filter((item: { level: number }) => item.level === 1)?.[0]
            ?.name;
          const collectionString = productTaxons.find((item: { ancestors: string[] }) =>
            item.ancestors.includes('Collections')
          )?.name;
          itemData = {
            ...itemData,
            recommendationAttributes: {
              categoryString,
              collectionString,
              blogCategoryString,
            },
          };
        }

        return item;
      }) || [],
  };

  return (
    <>
      <PageClient
        productData={productData?.value}
        originalMenuData={originalMenuData.status === 'fulfilled' ? originalMenuData.value ?? {} : {}}
        shopTheLook={shopTheLook.status === 'fulfilled' ? shopTheLook.value?.content ?? {} : {}}
        sbData={finalSbData}
      />
      <WebMiniCart />
      <SbPage blok={finalSbData} />
    </>
  );
}

/**
 * ISR in Next:
 * https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
 */
export async function generateStaticParams() {
  // Return a list of possible value for locale
  const prefixes = getStaticPrefixes();

  const productSlugs = ['owen-chaise-sectional-sofa'];
  const arr = prefixes.reduce((acc: any, path: any) => {
    productSlugs.forEach((slug) => {
      acc.push({
        ...path,
        slug,
      });
    });
    return acc;
  }, []);

  const variations = experimentDefaultMap.get(EcEnv.NEXT_PUBLIC_COUNTRY)?.map((item) => `pla-layout-${item}`) || [];
  const finalArr = arr.reduce((acc: any, path: any) => {
    variations.forEach((variation) => {
      acc.push({
        ...path,
        variationSlug: variation,
      });
    });
    return acc;
  }, []);
  return finalArr;
}

const getStaticPrefixes = () => {
  // Return a list of possible value for locale
  // const locales = languages;
  // const regions = supportRegions;
  const regions = EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase();

  //Get the paths we want to pre-render based on posts
  // const prefixes = locales.reduce((acc: any, locale: string) => {
  //   regions.forEach((region) => {
  //     acc.push({ locale, region });
  //   });
  //   return acc;
  // }, []);
  const prefixes = [{ region: regions, locale: 'en', deviceTheme: 'mobile' }];
  return prefixes;
};

interface PageProps {
  params: {
    locale: string;
    region: string;
    slug: string;
    variationSlug: string;
  };
}
