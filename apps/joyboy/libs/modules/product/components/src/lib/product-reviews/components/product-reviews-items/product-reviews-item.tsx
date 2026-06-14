'use client';

import { Button, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { GlobalReview } from '@castlery/modules-product-domain';
import { Rating } from '@castlery/shared-components';
import { CountryCodeToName, parseReviewsDate } from '@castlery/utils';
import { ProductReviewsItemContent } from './product-reviews-item-content';
import { ProductReviewsItemReply } from './product-reviews-item-reply';
import { Hot } from '@castlery/fortress/Icons';
import { useState } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_PDP_REVIEW_SECTION } from '@castlery/modules-tracking-services';

interface ProductReviewsItemProps {
  review: GlobalReview;
  onReviewImageClick: (review: GlobalReview, imageUrl: string, imageKey: string) => void;
}

export function ProductReviewsItem(props: ProductReviewsItemProps) {
  const { review, onReviewImageClick } = props;
  const { desktop, mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const [reviewReplyOpen, setReviewReplyOpen] = useState(false);

  const formattedDate = review?.created_at ? parseReviewsDate(review?.created_at) : '';

  return (
    <Stack
      sx={(theme) => ({
        padding: desktop ? theme.spacing(4) : `${theme.spacing(5)} ${theme.spacing(4)}`,
        backgroundColor: theme.palette.brand.warmLinen[500],
        width: '100%',
        minWidth: 0,
      })}
    >
      <Stack
        direction="column"
        // alignItems={desktop ? 'flex-start' : 'center'}
        sx={(theme) => ({
          width: '100%',
        })}
        gap={(theme) => (!desktop ? theme.spacing(5) : theme.spacing(4))}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={1}
          sx={(theme) => ({
            width: '100%',
          })}
        >
          <Stack gap={1}>
            <Stack
              direction="row"
              alignItems={desktop ? 'center' : 'flex-start'}
              gap={2}
              sx={{
                ...(!desktop && {
                  '& > div:first-of-type': {
                    marginTop: '3px',
                  },
                }),
              }}
            >
              <Typography
                level="body1"
                sx={{
                  ...(mobile && {
                    maxWidth: '124px !important',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    minWidth: 0,
                  }),
                }}
              >
                {review?.user_name}
              </Typography>
              <Rating
                rating={review?.rating}
                size={15}
                innerType="outline"
                innerColor={'#A45B37'}
                outerColor={'transparent'}
              />
            </Stack>
            <Stack direction="row" alignItems="flex-end">
              {review?.is_featured === true && <Hot sx={{ width: '20px !important', height: '20px !important' }} />}
              <Typography
                level="caption1"
                sx={{
                  color: 'var(--fortress-palette-brand-mono-700)',
                  lineHeight: '16px !important',
                }}
              >
                {CountryCodeToName[review?.country as keyof typeof CountryCodeToName]}
              </Typography>
            </Stack>
          </Stack>
          <Typography
            level="subh3"
            sx={{
              color: 'var(--fortress-palette-brand-mono-700)',
              ...(!desktop && {
                lineHeight: '20px !important',
              }),
            }}
          >
            {formattedDate?.toUpperCase()}
          </Typography>
        </Stack>

        <Stack
          flex={desktop ? 6.28 : 'none'}
          sx={{
            width: '100%',
            minWidth: 0,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={(theme) => ({
              marginBottom: desktop ? theme.spacing(4) : theme.spacing(2),
            })}
          >
            <Typography level="h4">{review?.title}</Typography>
          </Stack>
          <ProductReviewsItemContent review={review} onReviewImageClick={onReviewImageClick} />
        </Stack>
      </Stack>
      {review?.replies?.length > 0 && (
        <Button
          variant="plain"
          onClick={() => {
            dispatch(
              EVENT_PDP_REVIEW_SECTION({
                action: reviewReplyOpen ? 'collapse' : 'expand',
                label: 'castlery_response_review',
              })
            );
            setReviewReplyOpen(!reviewReplyOpen);
          }}
        >
          <Typography
            level="subh3"
            sx={(theme) => ({
              color: theme.palette.brand.burntOrange[500],
              textTransform: 'uppercase',
            })}
          >
            {reviewReplyOpen ? 'Hide reply' : 'View reply'}
          </Typography>
        </Button>
      )}
      {reviewReplyOpen && <ProductReviewsItemReply replies={review?.replies} />}
    </Stack>
  );
}
