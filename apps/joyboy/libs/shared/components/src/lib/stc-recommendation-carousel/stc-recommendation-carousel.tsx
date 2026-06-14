'use client';

import { EcEnv } from '@castlery/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Button, Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
// eslint-disable-next-line @nx/enforce-module-boundaries
import RightArrow from '@castlery/fortress/Icons/svg/RightArrow';
import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import { EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT, EVENT_RECOMMENDATIONS } from '@castlery/modules-tracking-services';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProductItemDataProps } from '../recommendation-carousel/product-item';
import { ProductList } from '../recommendation-carousel/product-list';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useAppDispatch } from '@castlery/shared-redux-store';
interface ProductData {
  group_id: string;
  categories: string[];
  keywords: string[];
  in_stock: boolean;
  publish_time: string;
  name: string;
  url: string;
  image_url: string;
  price: number;
  color: string;
  dy_display_price: string;
  featured: string;
  west_quick_ship: string;
  is_new: string;
  west_good_leadtime: string;
  collection: string;
  left_in_stock: string;
  east_quick_ship: string;
  is_sale: string;
  sale_price: string;
  product_tag: string;
  is_clearance: string;
  spu_name: string;
  east_good_leadtime: string;
  material: string;
  badge_url: string;
  include_swatch: string;
  deliver: string;
  delivery_before_x: string;
  lifestyle_image: string;
  additional_image_link: string;
  shortest_lead_time: string;
  icu: string;
  southeast_quick_ship: string;
  northwest_quick_ship: string;
  southeast_good_leadtime: string;
  northwest_good_leadtime: string;
  regional_icu: string;
  regional_stock: string;
  toShow: string;
  badges: string;
  is_blog: string;
  option_value_material: string;
  blog_description: string;
  product_breadcrumbs: string;
  badgesArr: string[];
  product_short_description: string;
  variant_id: string;
}

export interface DYProduct {
  sku: string;
  productData: ProductData;
  slotId: string;
}

interface StcRecommendationCarouselProps {
  selector_names: string[];
  onClick?: (header: string) => void;
  fallbackWidget?: React.ReactNode;
  containerSx?: any;
  customPageAttributes?: Record<string, any>;
}

const StcRecommendationCarousel = ({
  selector_names,
  onClick,
  fallbackWidget,
  containerSx,
  customPageAttributes,
}: StcRecommendationCarouselProps) => {
  const dyApiPreview = useSearchParams().get('dyApiPreview') || '';

  const cookiePersistence = makePersistenceHandles();

  const dispatch = useAppDispatch();

  const { desktop } = useBreakpoints();

  const campaigns = useGetDyCampaignsQuery(
    {
      campaignNames: selector_names || [],
      query: { dyApiPreview },
      ...(customPageAttributes && { customPageAttributes }),
    },
    { skip: !selector_names }
  );

  const [mainProducts, setMainProducts] = useState<ProductItemDataProps[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTrackedImpressionRef = useRef(false);

  const trackImpression = useCallback(() => {
    if (hasTrackedImpressionRef.current) return;
    hasTrackedImpressionRef.current = true;
    dispatch(
      EVENT_RECOMMENDATIONS({
        pageComponent: 'regular',
        category: 'recommendation_impression',
        action: 'impression',
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (mainProducts.length === 0) return;

    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 1) {
          trackImpression();
          observer.disconnect();
        }
      },
      { threshold: 1 }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [mainProducts.length, trackImpression]);
  const [forceShowFallback, setForceShowFallback] = useState(false);
  const [productsConfig, setProductsConfig] = useState<{
    header: string;
    headerLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    headerPosition: 'left' | 'center' | 'right';
    headerColor: string;
    description: string;
    bgColor: string;
    imageType: 'base_image' | 'lifestyle_image';
    listLength: number;
    applyATCAndWishlist: boolean;
    hoverStatus: boolean;
    needSliderDisplay: boolean;
    linkText: string;
    linkUrl: string;
    linkTextColor: string;
    linkType: 'button' | 'link';
  }>();

  const formattedProducts = (products: DYProduct[]) => {
    if (!products) return [];
    const groupIds: string[] = [];
    const tempProducts: ProductItemDataProps[] = [];
    products.forEach((product: DYProduct) => {
      const { productData } = product;
      if (!groupIds.includes(productData.group_id)) {
        groupIds.push(productData.group_id);
        tempProducts.push({
          sku: product.sku,
          badges: productData.badges ? productData.badges.split(',') : [],
          images: {
            base: productData.image_url,
            lifestyle: productData.lifestyle_image,
          },
          variantId: productData.variant_id,
          inStock: productData.in_stock,
          name: productData.name,
          price: productData.price,
          salePrice: productData.sale_price,
          productShortDescription: productData.product_short_description,
          spuName: productData.spu_name,
          url: productData.url,
          slotId: product.slotId,
        });
      }
    });
    return tempProducts;
  };

  const decorateLink = (link: string) => {
    const envTag = `www${EcEnv.NEXT_PUBLIC_APPLICATION_ENV.indexOf('test') > -1 ? '-test' : ''}.castlery.com`;
    if (link.startsWith(envTag)) {
      const newLink = link.replace(`${envTag}`, '');
      return newLink;
    }
    return link;
  };

  useEffect(() => {
    // 如果还在加载中，不执行任何操作，避免过早显示 fallback
    if (campaigns.status === 'pending') {
      return;
    }

    if (
      campaigns.status === 'fulfilled' &&
      campaigns.data?.choices &&
      campaigns.data.choices.length === selector_names.length
    ) {
      let mainData = null;
      let secondaryData = null;
      const data1 = campaigns?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data;
      const data2 = campaigns?.currentData?.choices?.[1]?.variations?.[0]?.payload?.data;
      const priority1 = data1?.custom?.priority || -1;
      const priority2 = data2?.custom?.priority || -1;
      if (priority1 < priority2 || priority2 === -1) {
        mainData = data1;
        secondaryData = data2;
      } else {
        mainData = data2;
        secondaryData = data1;
      }
      if (mainData?.slots?.length === 0) {
        setForceShowFallback(true);
      } else {
        // 如果数据有效，重置 forceShowFallback
        setForceShowFallback(false);
      }
      const products: DYProduct[] = [...(mainData?.slots || []), ...(secondaryData?.slots || [])];
      const formattedProductsBySPU = formattedProducts(products).slice(0, mainData?.custom?.listLength || 12);
      setMainProducts(formattedProductsBySPU);
      setProductsConfig({
        header: mainData?.custom?.header || '',
        headerLevel: mainData?.custom?.headerLevel || 'h1',
        headerPosition: mainData?.custom?.headerPosition || 'left',
        headerColor: mainData?.custom?.headerColor || '',
        description: mainData?.custom?.description || '',
        bgColor: mainData?.custom?.backgroundColor || '',
        imageType: mainData?.custom?.imageType || 'base_image',
        listLength: mainData?.custom?.listLength || 12,
        applyATCAndWishlist: mainData?.custom?.applyATCAndWishlist === 'true' || false,
        hoverStatus: mainData?.custom?.hoverStatus === 'true' || false,
        needSliderDisplay: mainData?.custom?.needSliderDisplay === 'true' || false,
        linkText: mainData?.custom?.linkText || '',
        linkUrl: decorateLink(mainData?.custom?.linkUrl || ''),
        linkTextColor: mainData?.custom?.linkTextColor || '',
        linkType: mainData?.custom?.linkType || 'link',
      });
    } else {
      // 只有在明确失败或数据不满足条件时才设置 fallback
      setForceShowFallback(true);
    }
  }, [campaigns]);

  const onClickSuccess = ({ slotId }: { slotId: string }) => {
    dispatch(EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT({ slotId }));
  };

  if (
    campaigns?.status === 'fulfilled' &&
    mainProducts?.length > 0 &&
    productsConfig &&
    JSON.stringify(productsConfig) !== '{}'
  ) {
    const decoratedSelectorName = selector_names[0].replaceAll(' ', '-').toLocaleLowerCase();
    const selectorId = `dy-recommendation-carousel-${decoratedSelectorName}`;
    return (
      <Stack
        ref={containerRef}
        id={selectorId}
        sx={(theme) => ({
          width: '100%',
          padding: productsConfig.needSliderDisplay
            ? `0 0 ${desktop ? '40px' : '32px'} ${desktop ? '32px' : '24px'}`
            : `0 ${desktop ? '32px' : '24px'} ${desktop ? '40px' : '32px'} ${desktop ? '32px' : '24px'}`,
          backgroundColor: productsConfig.bgColor || theme.palette.brand.warmLinen[200],
          ...(!desktop && {
            padding: `32px ${theme.spacing(6)}`,
          }),
          ...containerSx,
        })}
      >
        {(productsConfig.header || productsConfig.description || productsConfig.linkText || productsConfig.linkUrl) && (
          <Stack
            sx={(theme) => ({
              paddingTop: desktop ? theme.spacing(10) : theme.spacing(8),
              marginBottom: theme.spacing(8),
              alignItems: productsConfig.headerPosition === 'center' ? 'center' : 'flex-start',
            })}
          >
            <Stack
              sx={(theme) => ({
                flexDirection: 'row',
                alignItems: 'center',
                mb: {
                  xs: '16px',
                  md: '24px',
                },
              })}
            >
              {productsConfig.header && (
                <Typography
                  level="h2"
                  sx={(theme) => ({
                    color: productsConfig.headerColor || theme.palette.brand.maroonVelvet[500],
                    ...(!desktop && {
                      fontSize: '24px !important',
                    }),
                  })}
                >
                  {productsConfig.header}
                </Typography>
              )}
            </Stack>
            {productsConfig.description && (
              <Typography sx={{ marginBottom: desktop ? '16px' : '8px' }}>{productsConfig.description}</Typography>
            )}
            {productsConfig.linkText && productsConfig.linkUrl && productsConfig.linkType === 'button' && (
              <Stack>
                <Button
                  sx={{ width: 'fit-content' }}
                  variant="secondary"
                  onClick={() => {
                    onClick?.(productsConfig.header);
                    if (productsConfig.linkUrl) {
                      window.setTimeout(() => {
                        window.location.href = productsConfig.linkUrl;
                      }, 500);
                    }
                  }}
                >
                  {productsConfig.linkText}
                </Button>
              </Stack>
            )}
            {productsConfig.linkText && productsConfig.linkUrl && productsConfig.linkType === 'link' && (
              <Stack>
                <Link
                  href={productsConfig.linkUrl}
                  onClick={() => onClick?.(productsConfig.header)}
                  sx={(theme) => ({
                    textDecoration: 'underline',
                    textDecorationColor: productsConfig.linkTextColor || theme.palette.brand.burntOrange[500],
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    color: productsConfig.linkTextColor || theme.palette.brand.burntOrange[500],
                  })}
                  endDecorator={
                    <RightArrow
                      sx={(theme) => ({
                        width: '24px',
                        height: '24px',
                      })}
                      fill={productsConfig.linkTextColor}
                    />
                  }
                >
                  <Typography
                    sx={(theme) => ({
                      color: productsConfig.linkTextColor || theme.palette.brand.burntOrange[500],
                      fontSize: 20,
                      mr: '4px',
                      ...(!desktop && {
                        fontSize: '14px !important',
                      }),
                    })}
                  >
                    {productsConfig.linkText}
                  </Typography>
                </Link>
              </Stack>
            )}
          </Stack>
        )}
        <ProductList
          openHover={productsConfig.hoverStatus}
          imageType={productsConfig.imageType}
          products={mainProducts}
          bgColor={productsConfig.bgColor}
          needSliderDisplay={productsConfig.needSliderDisplay}
          applyATCAndWishlist={productsConfig.applyATCAndWishlist}
          onClickSuccess={onClickSuccess}
        />
      </Stack>
    );
  }

  // 兼容DY API超时错误 - 当API调用失败时显示fallback widget
  // 注意：只有在明确失败或数据不满足条件时才显示 fallback，加载中时不显示
  if (
    campaigns?.status !== 'pending' &&
    (campaigns?.status === 'rejected' || campaigns?.isError || forceShowFallback)
  ) {
    if (fallbackWidget) {
      return fallbackWidget;
    }
    // 如果没有fallback widget，则不显示任何内容（静默失败，不影响页面其他部分）
    return null;
  }

  // 数据加载中，不显示任何内容（等待加载完成）
  if (campaigns?.status === 'pending') {
    return null;
  }

  // if (campaign?.status === 'fulfilled' && products?.length === 0 && fallbackWidget) {
  //   return fallbackWidget;
  // }

  return null;
};

export { StcRecommendationCarousel };
