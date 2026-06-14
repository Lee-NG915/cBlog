'use client';

import { EcEnv } from '@castlery/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Button, Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
// eslint-disable-next-line @nx/enforce-module-boundaries
import RightArrow from '@castlery/fortress/Icons/svg/RightArrow';
import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ProductItemDataProps } from './product-item';
import { ProductList } from './product-list';

import { EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';

// DY 推荐商品数据结构，仅在本文件内部使用，避免与其他模块的 ProductData 命名冲突
interface RecommendationProductData {
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
  option_value_presentation: string;
}

export interface DYProduct {
  sku: string;
  productData: RecommendationProductData;
  slotId: string;
}

interface RecommendationCarouselProps {
  selector_name: string;
  onClick?: (header: string) => void;
  onRenderSuccess?: (header: string) => void;
  fallbackWidget?: React.ReactNode;
  pendingNode?: React.ReactNode;
  containerSx?: any;
  customPageAttributes?: Record<string, any>;
}

const DYRecommendationCarousel = ({
  selector_name,
  onClick,
  onRenderSuccess,
  fallbackWidget,
  pendingNode,
  containerSx,
  customPageAttributes,
}: RecommendationCarouselProps) => {
  const dyApiPreview = useSearchParams().get('dyApiPreview') || '';
  const { desktop } = useBreakpoints();
  const dispatch = useAppDispatch();

  const campaign = useGetDyCampaignsQuery(
    {
      campaignNames: [selector_name || ''],
      query: { dyApiPreview },
      ...(customPageAttributes && { customPageAttributes }),
    },
    { skip: !selector_name }
  );

  const onClickSuccess = ({ slotId }: { slotId: string }) => {
    dispatch(EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT({ slotId }));
  };

  const products = useMemo(
    () =>
      campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.slots ||
      campaign?.currentData?.[selector_name]?.data?.slots ||
      [],
    [campaign?.currentData, selector_name]
  );

  const decorateLink = (link: string) => {
    const envTag = `www${EcEnv.NEXT_PUBLIC_APPLICATION_ENV.indexOf('test') > -1 ? '-test' : ''}.castlery.com`;
    if (link.startsWith(envTag)) {
      const newLink = link.replace(`${envTag}`, '');
      return newLink;
    }
    return link;
  };

  const contentConfig = useMemo(() => {
    const content =
      campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.custom ||
      campaign?.currentData?.[selector_name]?.data?.custom ||
      {};
    return {
      header: content?.header || '',
      header_level: content?.headerLevel || 'h1',
      header_position: content?.headerPosition || 'left',
      header_color: content?.headerColor || '',
      description: content?.description || '',
      bg_color: content?.backgroundColor || '',
      image_type: content?.imageType || 'base_image',
      list_length: content?.listLength || 8,
      applyATCAndWishlist: content?.applyATCAndWishlist === 'true' || false,
      hoverStatus: content?.hoverStatus === 'true' || false,
      needSliderDisplay: content?.needSliderDisplay === 'true' || false,
      linkText: content?.linkText || '',
      linkUrl: decorateLink(content?.linkUrl || ''),
      linkTextColor: content?.linkTextColor || '',
      linkType: content?.linkType || 'link',
    };
  }, [campaign?.currentData, selector_name]);

  useEffect(() => {
    if (campaign?.status === 'fulfilled' && products?.length > 0 && contentConfig.header) {
      onRenderSuccess?.(contentConfig.header);
    }
  }, [campaign?.status, products?.length, contentConfig.header, onRenderSuccess]);

  const formattedProducts = useCallback(() => {
    if (!products) return [];
    const groupIds: string[] = [];
    const tempProducts: ProductItemDataProps[] = [];
    products.forEach((product: DYProduct) => {
      const { productData } = product;
      if (!groupIds.includes(productData.group_id)) {
        groupIds.push(productData.group_id);
        const optionValues =
          typeof productData.option_value_presentation === 'string'
            ? JSON.parse(productData.option_value_presentation)
            : [];
        const optionValuesPresentation = optionValues.map((option: string) => option).join(', ');

        tempProducts.push({
          sku: product.sku,
          badges: productData.badges.split(','),
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
          productOptionsPresentation: optionValuesPresentation,
        });
      }
    });
    return tempProducts.slice(0, contentConfig.list_length);
  }, [products, contentConfig]);

  if (campaign.isLoading || (campaign.isFetching && !campaign.currentData)) {
    return pendingNode ?? null;
  }

  if (campaign?.status === 'fulfilled' && products?.length > 0 && JSON.stringify(contentConfig) !== '{}') {
    const decoratedSelectorName = selector_name.replaceAll(' ', '-').toLocaleLowerCase();
    const selectorId = `dy-recommendation-carousel-${decoratedSelectorName}`;
    return (
      <Stack
        id={selectorId}
        sx={(theme) => ({
          width: '100%',
          padding: contentConfig.needSliderDisplay
            ? `0 0 ${desktop ? '40px' : '32px'} ${desktop ? '32px' : '24px'}`
            : `0 ${desktop ? '32px' : '24px'} ${desktop ? '40px' : '32px'} ${desktop ? '32px' : '24px'}`,
          backgroundColor: contentConfig.bg_color || theme.palette.brand.warmLinen[200],
          ...(!desktop && {
            padding: `32px ${theme.spacing(6)}`,
          }),
          ...containerSx,
        })}
      >
        {(contentConfig.header || contentConfig.description || contentConfig.linkText || contentConfig.linkUrl) && (
          <Stack
            sx={(theme) => ({
              paddingTop: desktop ? theme.spacing(10) : theme.spacing(8),
              marginBottom: theme.spacing(8),
              alignItems: contentConfig.header_position === 'center' ? 'center' : 'flex-start',
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
              {contentConfig.header && (
                <Typography
                  level="h2"
                  sx={(theme) => ({
                    color: contentConfig.header_color || theme.palette.brand.maroonVelvet[500],
                    ...(!desktop && {
                      fontSize: '24px !important',
                    }),
                  })}
                >
                  {contentConfig.header}
                </Typography>
              )}
            </Stack>
            {contentConfig.description && (
              <Typography sx={{ marginBottom: desktop ? '16px' : '8px' }}>{contentConfig.description}</Typography>
            )}
            {contentConfig.linkText && contentConfig.linkUrl && contentConfig.linkType === 'button' && (
              <Stack>
                <Button
                  sx={{ width: 'fit-content' }}
                  variant="secondary"
                  onClick={() => {
                    onClick?.(contentConfig.header);
                    if (contentConfig.linkUrl) {
                      window.setTimeout(() => {
                        window.location.href = contentConfig.linkUrl;
                      }, 500);
                    }
                  }}
                >
                  {contentConfig.linkText}
                </Button>
              </Stack>
            )}
            {contentConfig.linkText && contentConfig.linkUrl && contentConfig.linkType === 'link' && (
              <Stack>
                <Link
                  href={contentConfig.linkUrl}
                  onClick={() => onClick?.(contentConfig.header)}
                  sx={(theme) => ({
                    textDecoration: 'underline',
                    textDecorationColor: contentConfig.linkTextColor || theme.palette.brand.burntOrange[500],
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    color: contentConfig.linkTextColor || theme.palette.brand.burntOrange[500],
                  })}
                  endDecorator={
                    <RightArrow
                      sx={(theme) => ({
                        width: '24px',
                        height: '24px',
                      })}
                      fill={contentConfig.linkTextColor}
                    />
                  }
                >
                  <Typography
                    sx={(theme) => ({
                      color: contentConfig.linkTextColor || theme.palette.brand.burntOrange[500],
                      fontSize: 20,
                      mr: '4px',
                      ...(!desktop && {
                        fontSize: '14px !important',
                      }),
                    })}
                  >
                    {contentConfig.linkText}
                  </Typography>
                </Link>
              </Stack>
            )}
          </Stack>
        )}
        <ProductList
          openHover={contentConfig.hoverStatus}
          imageType={contentConfig.image_type}
          products={formattedProducts()}
          bgColor={contentConfig.bg_color}
          needSliderDisplay={contentConfig.needSliderDisplay}
          applyATCAndWishlist={contentConfig.applyATCAndWishlist}
          onClickSuccess={onClickSuccess}
        />
      </Stack>
    );
  }

  // 兼容DY API超时错误 - 当API调用失败时显示fallback widget
  if (campaign?.status === 'rejected' || campaign?.isError) {
    if (fallbackWidget) {
      return fallbackWidget;
    }
    // 如果没有fallback widget，则不显示任何内容（静默失败，不影响页面其他部分）
    return null;
  }

  if (campaign?.status === 'fulfilled' && products?.length === 0 && fallbackWidget) {
    return fallbackWidget;
  }

  return null;
};

export { DYRecommendationCarousel };
