'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Box, Loading, Sheet, useBreakpoints } from '@castlery/fortress';
import { ProductDyPromotionItem } from './components/product-dy-promotion-item';
import { selectVariant } from '@castlery/modules-product-domain';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { useMemo, useRef, useEffect, useCallback } from 'react';
import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import { formatCampaignsResponse } from '@castlery/utils';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

interface DyPromotionConfig {
  selector: string;
  rank: string;
}

const promotions: DyPromotionConfig[] = [
  {
    selector: 'PDP Promotion with API',
    rank: '',
  },
  {
    selector: 'PDP Promotion1 with API',
    rank: '1',
  },
  {
    selector: 'PDP Promotion2 with API',
    rank: '2',
  },
];

export const ProductDyPromotionClient = () => {
  const { mobile, tablet } = useBreakpoints();
  const variant = useAppSelector(selectVariant);
  const dispatch = useAppDispatch();
  const reportedSelectorsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    reportedSelectorsRef.current.clear();
  }, [variant?.id]);

  const queryParams = useMemo(() => {
    return {
      campaignNames: promotions?.map((promotion) => promotion.selector),
      // recommendationContext: {
      //   type: DYPageTypes.PRODUCT,
      //   data: [variant?.sku || ''],
      // },
    };
  }, [variant?.sku]);

  const { data: campaignsData, isLoading } = useGetDyCampaignsQuery(queryParams, {
    skip: !variant?.sku,
    refetchOnMountOrArgChange: true,
  });

  const dyPromotions = useMemo(() => {
    if (campaignsData?.choices) {
      const formatData = formatCampaignsResponse(campaignsData.choices);
      const dyPromotionItems = promotions.map((promotion) => {
        if (
          formatData[promotion.selector]?.hitVariation &&
          JSON.stringify(formatData[promotion.selector]?.hitVariation) !== '{}'
        ) {
          return {
            ...promotion,
            promotionData: formatData[promotion.selector]?.hitVariation,
          };
        }
        return undefined;
      });
      return dyPromotionItems.filter((item) => item !== undefined);
    }
    return [];
  }, [campaignsData]);

  const handleImpression = useCallback(
    (selector: string, rank: string) => {
      if (reportedSelectorsRef.current.has(selector)) {
        return;
      }

      reportedSelectorsRef.current.add(selector);

      dispatch(
        EVENT_PDP_DETAILS({
          action: `impression_product_promotion${rank}`,
        })
      );
    },
    [dispatch]
  );

  if (dyPromotions?.length === 0) {
    return null;
  }

  return (
    <Box px={mobile ? 6 : tablet ? 6 : undefined}>
      {isLoading ? (
        <Loading theme="dark" />
      ) : (
        <Sheet
          variant="solid"
          sx={(theme) => ({
            width: '100%',
            position: 'relative',
            mt: mobile ? 6 : 7,
            '.swiper-dy-promotion': {
              py: 3,
              px: 4,
              '.swiper-pagination': {
                // bottom: `${theme.spacing(2)}`,
                position: 'relative',
                top: 0,
                textAlign: 'center',
              },
              '.swiper-pagination-bullet': {
                width: '8px',
                height: '8px',
                display: 'inline-block',
                borderRadius: '50%',
                bgcolor: 'var(--fortress-palette-brand-mono-200)',
                mx: '4px',
                cursor: 'pointer',
              },
              '.swiper-pagination-bullet-active': {
                bgcolor: 'var(--fortress-palette-brand-mono-600)',
              },
            },
            ...(dyPromotions.length === 1 && {
              py: 3,
              px: 4,
            }),
          })}
        >
          {dyPromotions.length > 1 ? (
            <Swiper
              key={`swiper-${variant?.id}`}
              modules={[Pagination, Autoplay]}
              spaceBetween={16}
              slidesPerView={1}
              grabCursor={true}
              touchRatio={1}
              touchAngle={45}
              speed={300}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{
                enabled: true,
                clickable: true,
                bulletClass: 'swiper-pagination-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active',
                horizontalClass: 'swiper-pagination-horizontal',
              }}
              className="swiper-dy-promotion"
            >
              {dyPromotions.map((promotion) => (
                <SwiperSlide key={`${variant?.id}-${promotion?.selector}`}>
                  <ProductDyPromotionItem {...promotion} onImpression={handleImpression} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <ProductDyPromotionItem
              key={`${variant?.id}-${dyPromotions[0]?.selector}`}
              {...dyPromotions[0]}
              onImpression={handleImpression}
            />
          )}
        </Sheet>
      )}
    </Box>
  );
};
