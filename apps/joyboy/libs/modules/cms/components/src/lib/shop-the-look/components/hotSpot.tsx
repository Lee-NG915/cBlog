'use client';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { HotspotsV2 } from '@castlery/modules-cms-domain';
import { ArrowForwardIos } from '@castlery/fortress/Icons';
import { Box, Card, Typography } from '@castlery/fortress';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { VariantPrice } from '@castlery/modules-product-components';
import { FortressImage, CustomLink } from '@castlery/shared-components';
import { EcEnv } from '@castlery/config';
import { useParams } from 'next/navigation';

import Spot from './spot';
import { ShopTheLookModuleName } from '../config';
import { useTrackingTags } from '@castlery/modules-tracking-components';

type PopPosition = 'above' | 'below' | 'left' | 'right';
export interface HotSpotProps {
  hotspot: HotspotsV2;
  position: number;
  variantsData: any;
  lookId: string;
  viewAll: boolean;
  mobileClickHandler: () => void;
}

export default function HotSpot({
  lookId,
  position,
  hotspot,
  viewAll,
  variantsData,
  mobileClickHandler,
}: HotSpotProps) {
  const wrapperRef = useRef(null);
  const { desktop } = useBreakpoints();
  const { region } = useParams();
  const isMobile = !desktop;
  const [popupIsActive, setPopupIsActive] = useState(viewAll && !isMobile);
  const trackingTags = useTrackingTags({
    moduleName: ShopTheLookModuleName,
    elementName: 'Hotspot',
    content: {
      target: variantsData.product_slug,
    },
  });
  useEffect(() => {
    setPopupIsActive(viewAll && !isMobile);
  }, [viewAll, isMobile]);
  const skuVariant = useCallback(() => {
    let extraSlug = '';
    if (variantsData.variant_option_values.length > 0) {
      extraSlug =
        '?' +
        variantsData.variant_option_values
          .map((variant: any) => `${variant.option_type_name}=${variant.name}`)
          .join('&');
    }
    return extraSlug;
  }, [variantsData]);
  const { x, y, popup } = hotspot;
  if (!x || !y) return null;
  const popupPosition: PopPosition = popup as PopPosition;

  const showUpPosition: Record<PopPosition, { [key: string]: string }> = {
    above: { bottom: '100%' },
    below: { top: '100%' },
    left: { right: '100%' },
    right: { left: '100%' },
  };
  let popUpAttributes = {};
  if (isMobile) {
    popUpAttributes = {
      onClick: mobileClickHandler,
    };
  } else {
    popUpAttributes = {
      onMouseOver: () => {
        setPopupIsActive(true);
      },
      onMouseLeave: () => {
        if (!viewAll) {
          setPopupIsActive(false);
        }
      },
    };
  }

  return (
    <>
      <Box
        key={position}
        ref={wrapperRef}
        sx={{
          gridColumn: `${x}/${+x + 1}`,
          gridRow: `${y}/${+y + 1}`,
        }}
        {...popUpAttributes}
      >
        <Spot stopAnimation={popupIsActive} {...trackingTags}>
          <Card
            variant="outlined"
            sx={{
              zIndex: '2',
              flex: '0 0 350px',
              width: '350px',
              border: 'none',
              // padding: '10px 15px',
              padding: '8px 8px',
              position: 'absolute',
              backgroundColor: (theme) => theme.palette.brand.warmLinen[300],
              display: popupIsActive ? 'block' : 'none',
              ...showUpPosition[popupPosition],
              a: {
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              },
            }}
          >
            <CustomLink
              key={position}
              href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${region}/products/${variantsData.product_slug}${skuVariant()}`}
              // href={`https://www.castlery.com/${region}/products/${variantsData.product_slug}`}
              isExternalFlag={true}
            >
              <FortressImage
                imageWidth={120}
                imageHeight={85}
                sx={{
                  flex: '0 0 80px',
                }}
                // ratio={0.66}
                src={variantsData.images?.[0]?.links?.mini}
                alt={variantsData?.product_name}
              />
              <Box
                sx={{
                  flex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  margin: '0 15px',
                  fontSize: '14px',
                  fontWeight: '400',
                }}
              >
                <Typography
                  level="h5"
                  sx={(theme) => ({
                    mb: theme.spacing(2),
                    color: theme.palette.brand.maroonVelvet[500],
                  })}
                >
                  {variantsData?.product_name}
                </Typography>
                <VariantPrice variant={variantsData} minSaleQty={variantsData.min_sale_qty || 1} />
              </Box>

              <ArrowForwardIos
                name="arrow-next"
                sx={(theme) => ({
                  fill: theme.palette.brand.mono[900],
                })}
              />
            </CustomLink>
          </Card>
        </Spot>
      </Box>
    </>
  );
}
