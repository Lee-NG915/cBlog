'use client';

import { Box, Stack, Typography } from '@castlery/fortress';
import { GlobalReview, selectProduct, useLazyGetVariantByVariantIdQuery } from '@castlery/modules-product-domain';
import { FortressImage, NextFortressLink } from '@castlery/shared-components';
import { getVariantLink } from '@castlery/modules-product-services';
import { useCallback } from 'react';
import { EVENT_PDP_REVIEW_SECTION } from '@castlery/modules-tracking-services';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useRouter } from 'next/navigation';
import { logger } from '@castlery/observability/client';

interface ProductReviewsItemContentProps {
  review: GlobalReview;
  onReviewImageClick: (review: GlobalReview, imageUrl: string, imageKey: string) => void;
}

export const ProductReviewsItemContent = (props: ProductReviewsItemContentProps) => {
  const dispatch = useAppDispatch();
  const { review, onReviewImageClick } = props;
  const product = useAppSelector(selectProduct);
  const router = useRouter();
  const [getVariantByVariantId] = useLazyGetVariantByVariantIdQuery();

  const handleTrack = useCallback(
    async (action: string) => {
      await dispatch(EVENT_PDP_REVIEW_SECTION({ action }));
    },
    [dispatch]
  );

  const relativeProductDisplay = useCallback(() => {
    const productNamePrefix = review?.relation_type === 'related' ? 'Review on similar product ' : 'Review on ';
    const productNameDisplay =
      review?.variant?.is_available === true ? (
        <NextFortressLink
          href={getVariantLink(review?.variant, review?.variant?.product_slug)}
          level="caption1"
          sx={{
            display: 'inline',
          }}
          variant="secondary"
          onClick={async (e) => {
            if (getVariantLink(review?.variant, review?.variant?.product_slug)) {
              if (review?.variant?.product_slug === product?.slug) {
                e.preventDefault();
                try {
                  await getVariantByVariantId(review?.variant?.id, false).unwrap();
                  window.history.replaceState(
                    null,
                    '',
                    getVariantLink(review?.variant, review?.variant?.product_slug) as string
                  );
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } catch (error) {
                  logger.error('Failed to fetch variant', { error });
                  router.push(getVariantLink(review?.variant, review?.variant?.product_slug) as string);
                }
              }
            }
            handleTrack('click_review_link');
          }}
        >
          {/* <Typography level="caption1">{review?.variant?.name}</Typography> */}
          {review?.variant?.name}
        </NextFortressLink>
      ) : (
        <Typography level="caption1">{review?.variant?.name}</Typography>
      );
    return (
      <>
        <Typography level="caption1">
          {productNamePrefix}
          {productNameDisplay}
        </Typography>
      </>
    );
  }, [review, product?.slug, getVariantByVariantId, handleTrack, router]);

  return (
    <>
      <Stack>
        <Typography
          level="body2"
          sx={(theme) => ({
            width: '100%',
            minWidth: 0,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            marginBottom: theme.spacing(2),
          })}
        >
          {review?.content}
        </Typography>
        {review?.attachments?.length > 0 && (
          <Stack
            direction="row"
            flexWrap={'wrap'}
            gap={(theme) => theme.spacing(4)}
            sx={(theme) => ({
              marginBottom: theme.spacing(4),
            })}
          >
            {review?.attachments?.map((attachment: any, index: number) => {
              return (
                <Box
                  sx={{
                    width: '80px',
                    height: '80px',
                  }}
                >
                  <FortressImage
                    src={attachment?.url}
                    objectFit="cover"
                    ratio={1}
                    alt={`review from ${review?.title}`}
                    onClick={async () => {
                      onReviewImageClick(review, attachment?.url ?? '', attachment?.key ?? '');
                      handleTrack('view_review_image');
                    }}
                    sx={{
                      cursor: 'pointer',
                      transition: 'filter 0.2s ease',
                      '&:hover': {
                        filter: 'brightness(0.8)',
                      },
                    }}
                    sizes="128px"
                  />
                </Box>
              );
            })}
          </Stack>
        )}
        {relativeProductDisplay()}
      </Stack>
    </>
  );
};
