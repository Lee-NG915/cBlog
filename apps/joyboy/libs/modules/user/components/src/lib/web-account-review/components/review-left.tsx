'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Tag, useBreakpoints, IconButton, Stack } from '@castlery/fortress';
import type { ReviewItem } from '@castlery/types';
import { toPrice } from '@castlery/utils';
import ReviewItemImage from './review-item-image';
import { getLineItemLink, PlaceholderProductName } from './review-ltem-name';
import LineItemOptions from './review-item-option';
import { CustomLink, Rating } from '@castlery/shared-components';
import { Info, OOS, CheckCircle, Edit } from '@castlery/fortress/Icons';

interface ReviewLeftInfoProps {
  review: ReviewItem;
  switchToEdit: () => void;
  isSubmitReview?: boolean;
}

export default function ReviewLeftInfo({ review, switchToEdit, isSubmitReview = false }: ReviewLeftInfoProps) {
  const { mobile, desktop, tablet } = useBreakpoints();
  // 格式化商品数据
  const item = useMemo(() => {
    const lineItem: any = {
      product_type: review?.variant?.product_type,
      variant: review?.variant,
    };
    if (review?.variant?.product_type === 'bundle') {
      lineItem.bundle_line_items = review?.bundle_options?.map((o, index) => ({
        id: index,
        bundle_option: {
          bundle_option_type: o.bundle_option_type,
          name: o.name,
          presentation: o.presentation,
        },
        variant: o?.variant,
      }));
    }

    // 简化处理，移除 bundle 相关逻辑，因为 ReviewItem 类型中没有这些字段
    return lineItem;
  }, [review]);

  const hasDiscount = review?.variant?.price !== review?.variant?.list_price;
  // const isBundleItem = item.product_type === 'bundle' && item.product_layout === 'bundle_overlay';

  return (
    <Box
      sx={{
        // width: mobile ? '100%' : '223px',
        // ...(isSubmitReview && {
        //   width: mobile ? '100%' : '200px',
        // }),
        width: {
          xs: '100%',
          sm: isSubmitReview ? '200px' : '223px',
          md: isSubmitReview ? '240px' : '223px',
        },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mb: 2,
        flexShrink: 0,
      }}
    >
      {!isSubmitReview && (
        <Box sx={{ marginLeft: mobile ? 'auto' : 'none', display: 'flex', gap: 4 }}>
          {review?.status === 'published' && (
            <Tag variant="outlined" color="success" startDecorator={<CheckCircle width={20} height={20} />}>
              published
            </Tag>
          )}
          {review?.status === 'pending' && (
            <>
              <Tag variant="outlined" color="warning" startDecorator={<Info width={20} height={20} />}>
                pending
              </Tag>
              <IconButton
                sx={{
                  padding: 0,
                  color: 'var(--fortress-palette-brand-mono-900)',
                }}
                onClick={switchToEdit}
                aria-label="Edit review"
              >
                <Edit width={24} height={24} />
              </IconButton>
            </>
          )}
          {review?.status === 'unpublished' && (
            <Tag variant="outlined" startDecorator={<OOS width={20} height={20} />} color="danger">
              unpublished
            </Tag>
          )}
        </Box>
      )}

      <CustomLink href={getLineItemLink(item) || ''}>
        <ReviewItemImage lineItem={item} isSubmitReview={isSubmitReview} desktop={desktop} tablet={tablet} />
      </CustomLink>

      <PlaceholderProductName lineItem={item} />
      <LineItemOptions lineItem={item} />
      {!isSubmitReview && (
        <Stack sx={{ width: 'fit-content' }}>
          <Rating
            rating={review?.rating}
            margin={0}
            size={20}
            innerType="outline"
            innerColor={'#844025'}
            outerColor={'transparent'}
          />
        </Stack>
      )}
      {/* 价格显示 */}
      <Box>
        {hasDiscount ? (
          <Box>
            <Typography level="subh2">{toPrice(parseFloat(review?.variant?.price || '0'), true)}</Typography>
            <Typography
              level="subh2"
              sx={{
                textDecoration: 'line-through',
                color: 'var(--fortress-palette-brand-mono-500)',
              }}
            >
              {toPrice(parseFloat(review?.variant?.list_price || '0'), true)}
            </Typography>
          </Box>
        ) : (
          <Typography level="subh2">{toPrice(parseFloat(review?.variant?.price || '0'), true)}</Typography>
        )}
      </Box>
    </Box>
  );
}
