'use client';

import { EcEnv } from '@castlery/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import { EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT, EVENT_RECOMMENDATIONS } from '@castlery/modules-tracking-services';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { STCProductItemDataProps } from '../STCRecommendation';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { FortressImage } from '../fortress-image/fortress-image';
import { STCProductList } from '../STCRecommendation';

export interface ProductData {
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

interface BlendRecommendationCarouselProps {
  selector_name: string;
  campaign: any;
  onClick?: (header: string) => void;
  fallbackWidget?: React.ReactNode;
  containerSx?: any;
  customPageAttributes?: Record<string, any>;
}

const BlendRecommendationImageRotator = React.memo(({ products }: { products: STCProductItemDataProps[] }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { desktop, mobile } = useBreakpoints();

  const dispatch = useAppDispatch();

  const imageSize = useMemo(() => {
    if (desktop) {
      return {
        width: 440,
        height: 294,
      };
    }
    if (mobile) {
      return {
        width: 358,
        height: 238,
      };
    }
    return {
      width: 720,
      height: 479,
    };
  }, [desktop, mobile]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [products.length]);

  useEffect(() => {
    if (products.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % products.length);
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [products.length]);

  return (
    <Stack
      sx={{
        position: 'relative',
        width: '100%',
        height: imageSize.height,
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {products.length > 0 &&
        products.map((product, index) => (
          <Link
            href={product.url}
            key={product.sku}
            aria-label={`Go to ${product.name}`}
            style={{
              position: 'absolute',
              zIndex: index === activeImageIndex ? 1 : 0,
              opacity: index === activeImageIndex ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              pointerEvents: index === activeImageIndex ? 'auto' : 'none',
            }}
          >
            <FortressImage
              src={product.images.base}
              alt={product.name}
              imageWidth={imageSize.width}
              imageHeight={imageSize.height}
              ratio={imageSize.width / imageSize.height}
              lazy={false}
              sx={{
                backgroundColor: 'transparent',
              }}
              onClick={() => {
                dispatch(
                  EVENT_RECOMMENDATIONS({
                    pageComponent: 'flash',
                    category: 'recommendation_click',
                    action: 'click',
                    label: 'hero_image',
                    tag: 'target_sku',
                    tagValue: product.sku,
                  })
                );
              }}
            />
          </Link>
        ))}
    </Stack>
  );
});

const BlendRecommendationCarousel = ({
  selector_name,
  campaign,
  onClick,
  fallbackWidget,
  containerSx,
  customPageAttributes,
}: BlendRecommendationCarouselProps) => {
  const dispatch = useAppDispatch();

  const { desktop } = useBreakpoints();

  const onClickSuccess = ({ slotId }: { slotId: string }) => {
    dispatch(EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT({ slotId }));
  };

  const products = useMemo(
    () => campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.slots || [],
    [campaign?.currentData]
  );

  const contentConfig = useMemo(() => {
    const content = campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.custom || {};
    return {
      header: content?.header || '',
      headerLevel: content?.headerLevel || 'h1',
      headerPosition: content?.headerPosition || 'left',
      headerColor: content?.headerColor || '',
      description: content?.description || '',
      bgColor: content?.backgroundColor || '',
      listLength: content?.listLength || 8,
      applyATCAndWishlist: content?.applyATCAndWishlist === 'true' || false,
      needSliderDisplay: content?.needSliderDisplay === 'true' || false,
      displayDescription: content?.displayDescription === 'true' || false,
    };
  }, [campaign?.currentData]);

  const formattedProducts = () => {
    if (!products) return [];
    const groupIds: string[] = [];
    const tempProducts: STCProductItemDataProps[] = [];
    products.forEach((product: DYProduct) => {
      const { productData } = product;
      if (!groupIds.includes(productData.group_id)) {
        groupIds.push(productData.group_id);
        tempProducts.push({
          sku: product.sku,
          badges: productData.badges ? productData.badges.split(',') : [],
          images: {
            base: productData.image_url,
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
    return tempProducts.slice(0, contentConfig.listLength);
  };

  if (campaign?.status === 'fulfilled' && contentConfig && JSON.stringify(contentConfig) !== '{}') {
    const selectorId = `dy-recommendation-carousel-${selector_name}`;
    return (
      <Stack
        id={selectorId}
        sx={(theme) => ({
          backgroundColor: contentConfig.bgColor || theme.palette.brand.leafGreen[500],
          width: '100%',
          padding: `0 ${desktop ? '32px' : '24px'} ${desktop ? '40px' : '32px'} ${desktop ? '32px' : '24px'}`,
          ...(!desktop && {
            padding: `32px ${theme.spacing(6)}`,
          }),
          ...containerSx,
        })}
      >
        {contentConfig.header && (
          <Stack
            sx={(theme) => ({
              paddingTop: desktop ? theme.spacing(15) : theme.spacing(8),
              marginBottom: theme.spacing(1),
              alignItems: 'center',
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
              <Typography
                level="h2"
                sx={(theme) => ({
                  color: contentConfig.headerColor || theme.palette.brand.warmLinen[500],
                  ...(!desktop && {
                    fontSize: '22px !important',
                  }),
                })}
              >
                {contentConfig.header}
              </Typography>
            </Stack>
          </Stack>
        )}
        <BlendRecommendationImageRotator products={formattedProducts()} />
        <STCProductList
          products={formattedProducts()}
          bgColor={contentConfig.bgColor}
          needSliderDisplay={contentConfig.needSliderDisplay}
          applyATCAndWishlist={contentConfig.applyATCAndWishlist}
          onClickSuccess={onClickSuccess}
          displayDescription={contentConfig.displayDescription}
        />
      </Stack>
    );
  }

  // 兼容DY API超时错误 - 当API调用失败时显示fallback widget
  // 注意：只有在明确失败或数据不满足条件时才显示 fallback，加载中时不显示
  if (campaign?.status !== 'pending' && (campaign?.status === 'rejected' || campaign?.isError)) {
    if (fallbackWidget) {
      return fallbackWidget;
    }
    // 如果没有fallback widget，则不显示任何内容（静默失败，不影响页面其他部分）
    return null;
  }

  // 数据加载中，不显示任何内容（等待加载完成）
  if (campaign?.status === 'pending') {
    return null;
  }

  // if (campaign?.status === 'fulfilled' && products?.length === 0 && fallbackWidget) {
  //   return fallbackWidget;
  // }

  return null;
};

export { BlendRecommendationCarousel };
