'use client';
import React, { useEffect, useMemo } from 'react';
import { selectCMSStoryContent, setCMSData } from '@castlery/modules-cms-domain';
import { usePrice } from '@castlery/modules-product-components';
import {
  changeProduct,
  changeVariant,
  Product,
  selectProduct,
  selectVariant,
  Variant,
} from '@castlery/modules-product-domain';
import { ActionCreator, withReduxInitialization } from '@castlery/shared-components';
import { StoryblokWidgets } from '@castlery/modules-cms-components';
import Script from 'next/script';
import { Product as JsonLdProduct, WithContext } from '@castlery/seo';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { EcEnv } from '@castlery/config';
import { Stack, useBreakpoints } from '@castlery/fortress';
import { initDefaultZipcode } from '@castlery/modules-user-domain';
import { trackProductPageView } from '@castlery/modules-tracking-services';
import { useParams } from 'next/navigation';
import { setPtenginePresetParams } from '../../../../../../../lib/ptengine';
import cloneDeep from 'lodash.clonedeep';

const EnhancedWebPla = withReduxInitialization((props) => {
  const productData = useAppSelector(selectProduct);
  const variant = useAppSelector(selectVariant);
  const price = usePrice({
    product: productData as Product,
    variant: variant!,
    isBundle: false,
  });
  const storyContent = useAppSelector(selectCMSStoryContent);
  const storyContentCopy = useMemo(() => {
    return cloneDeep(storyContent);
  }, [storyContent]);
  const jsonLd: WithContext<JsonLdProduct> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productData!.name,
    image: variant?.images && variant?.images.length > 0 ? variant?.images[0].links.large : '',
    description: productData?.description,
    sku: variant?.sku,
    brand: {
      '@type': 'Brand',
      name: 'Castlery',
      url: `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
    },
    itemCondition: 'https://schema.org/NewCondition',
    offers: {
      '@type': 'Offer',
      priceCurrency: EcEnv.NEXT_PUBLIC_CURRENCY,
      price: price?.variantPrice,
      sku: variant?.sku,
      availability: `https://schema.org/InStock`,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
  const { desktop, tablet } = useBreakpoints();

  return (
    <>
      <Script
        id="pla-media-text"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Stack
        sx={{
          maxWidth: desktop ? 1728 : '100vw',
          mx: 'auto',
          pb: desktop ? '60px' : tablet ? 6 : 4,
        }}
      >
        <StoryblokWidgets
          stories={storyContentCopy?.body || []}
          uid={storyContentCopy?.uid}
          scrollMarginTop={desktop ? 50 : 40}
        />
      </Stack>
    </>
  );
});

export function WrappedWebPla(props: {
  result: Product;
  menuOriginalData: any;
  menuOuterData: any;
  collectionsData: any;
  globalNav: any;
  salePages: any;
  storyContent: any;
  shopTheLookInfo: any;
  pageMap: { [key: string]: string };
}) {
  const dispatch = useAppDispatch();
  const { variationSlug } = useParams();

  const actions = [
    // 手动更新 store，实现服务端和客户端的 store 保持一致
    () => changeProduct(props.result as Product),
    () => changeVariant(props.result?.variants[0] as Variant),
    () =>
      setCMSData([
        {
          slug: '/taxonomies/menu',
          data: props.menuOriginalData,
        },
      ]),
    () =>
      setCMSData([
        {
          slug: '/menu-group/menu-a',
          data: props.menuOuterData,
        },
      ]),
    () =>
      setCMSData([
        {
          slug: '/sale-pages',
          data: props.salePages,
        },
      ]),
    () =>
      setCMSData([
        {
          slug: '/story_bloks/global-nav',
          data: props.globalNav,
        },
      ]),
    () =>
      setCMSData([
        {
          slug: '/story_bloks/story-content',
          data: props.storyContent,
        },
      ]),
    () =>
      setCMSData([
        {
          slug: 'page-map',
          data: props.pageMap,
        },
      ]),
    () =>
      setCMSData([
        {
          slug: 'shop-the-look',
          data: props.shopTheLookInfo,
        },
      ]),
    () =>
      setCMSData([
        {
          slug: 'taxonomies/collections',
          data: props.collectionsData,
        },
      ]),
    () => initDefaultZipcode(),
  ];
  useEffect(() => {
    const slug = Array.isArray(variationSlug) ? variationSlug[0] : variationSlug;
    dispatch(trackProductPageView(slug));
    setPtenginePresetParams({ pageVariant: slug });
  }, [variationSlug, dispatch]);

  return <EnhancedWebPla {...props} actions={actions as unknown as ActionCreator[]} />;
}
