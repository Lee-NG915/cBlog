'use client';

import { Box, Link, Stack, Tag, Typography, useBreakpoints } from '@castlery/fortress';
import {
  Product,
  selectBundleVariants,
  selectDiscontinued,
  selectProduct,
  selectVariant,
} from '@castlery/modules-product-domain';
import { Rating } from '@castlery/shared-components';
import { useAppDispatch, useSelector } from '@castlery/shared-redux-store';
import { useCallback, useMemo } from 'react';
import { ProductLike } from './components/product-like/product-like';
import { ProductPrice } from './components/product-price/product-price';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';

export const ProductHeadClient = () => {
  const dispatch = useAppDispatch();
  const productData = useSelector(selectProduct) as Product;
  const variant = useSelector(selectVariant) || productData?.variants?.[0];
  const bundleVariant = useSelector(selectBundleVariants);
  const discontinued = useSelector(selectDiscontinued);
  const reviewsSummary = useMemo(() => productData?.reviews, [productData]);
  const { mobile, tablet } = useBreakpoints();

  const highlightBadgeList = ['Sale', 'Clearance', 'Extra 5% Off'];

  const handleTrackPDPDetails = useCallback(async () => {
    await dispatch(
      EVENT_PDP_DETAILS({
        action: 'x_reviews',
        label: `click`,
      })
    );

    setTimeout(() => {
      const reviewsContainer = document.getElementById('reviews-container');
      if (reviewsContainer) {
        reviewsContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1500);
  }, [dispatch]);

  return (
    <Stack justifyContent="center" alignItems={'flex-start'} px={mobile ? 6 : tablet ? 6 : undefined}>
      {variant && variant?.badges?.[0] && !mobile && (
        <Stack direction={'row'} alignItems={'center'} mb={3} gap={3} flexWrap={'wrap'}>
          <Tag
            variant="solid"
            sx={(theme) => ({
              backgroundColor: highlightBadgeList.includes(variant?.badges[0])
                ? theme.palette.brand.burntOrange[400]
                : theme.palette.brand.terracotta[500],
            })}
          >
            <Typography level="caption2">{variant?.badges[0]}</Typography>
          </Tag>
          {variant?.badges?.includes("Steve's picks") && variant?.badges?.[0] !== "Steve's picks" && (
            <Tag
              variant="solid"
              sx={(theme) => ({
                backgroundColor: theme.palette.brand.maroonVelvet[500],
              })}
            >
              <Typography level="caption2">Steve's picks</Typography>
            </Tag>
          )}
        </Stack>
      )}
      <Stack
        direction={'row'}
        alignItems={'flex-start'}
        justifyContent={'space-between'}
        sx={{
          width: '100%',
        }}
      >
        <Box
          sx={{
            pr: 5,
          }}
        >
          <Typography
            level="h1"
            sx={
              {
                //  display: 'inline',
              }
            }
          >
            {productData?.name}
          </Typography>
        </Box>
        {!discontinued && <ProductLike product={productData} variant={variant} bundleVariant={bundleVariant} />}
      </Stack>
      {reviewsSummary && 'average_rating' in reviewsSummary && reviewsSummary?.average_rating >= 3 && (
        <Stack direction={'row'} alignItems={'center'} mt={tablet ? 2 : 1}>
          <Rating
            rating={reviewsSummary?.average_rating}
            size={15}
            innerType="outline"
            innerColor={'#A45B37'}
            outerColor={'transparent'}
          />
          <Link variant="primary" href={`#reviews-container`} onClick={handleTrackPDPDetails} level="body2" ml={2}>
            {`${reviewsSummary?.total_count} ${reviewsSummary?.total_count > 1 ? 'reviews' : 'review'}`}
          </Link>
        </Stack>
      )}
      <Stack mt={mobile ? 3 : 5}>
        <ProductPrice product={productData} variant={variant} bundleVariant={bundleVariant} />
      </Stack>
    </Stack>
  );
};
