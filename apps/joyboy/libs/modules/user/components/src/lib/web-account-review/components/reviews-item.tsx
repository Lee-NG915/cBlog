'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Card, CardContent, useBreakpoints, Sheet } from '@castlery/fortress';
import type { ReviewItem, SubmitReviewData } from '@castlery/types';
import ReviewsRight from './reviews-right';
import ReviewLeftInfo from './review-left';
import { formatDate } from '@castlery/utils';
import ReviewForm from './reviews-form';

import { useUpdateReviewMutation } from '@castlery/modules-user-domain';
import { FortressImage } from '@castlery/shared-components';
import { PinchZoomViewer } from '@castlery/shared-components';
import { logger } from '@castlery/observability/client';

interface ReviewsItemProps {
  review: ReviewItem;
  modal: any;
}

export default function ReviewsItem({ review, modal }: ReviewsItemProps) {
  // 状态管理
  const [mode, setMode] = useState<'display' | 'edit'>('display');
  const { mobile } = useBreakpoints();
  const cardRef = useRef<HTMLDivElement>(null);
  const [updateReview] = useUpdateReviewMutation();
  // 监听 props 变化

  useEffect(() => {
    setMode('display');
  }, [review]);

  const switchToEdit = () => {
    setMode('edit');
  };

  const switchToDisplay = () => {
    setMode('display');
  };

  const handleSubmit = async (data: SubmitReviewData) => {
    try {
      const res = await updateReview({ id: review.id, data });
      if (res.error) {
        logger.error('Failed to update review - API error', { error: res.error, reviewId: review.id });
      } else {
        switchToDisplay();
        modal.success({
          title: 'Review updated!',
          desc: 'You will be notified of the status of your review within 3 working days. You will receive credits after the review is approved.',
          showCancelBtn: false,
          confirmText: 'OKAY',
        });
      }
    } catch (error) {
      logger.error('Failed to update review', { error, reviewId: review.id });
    }
  };

  const [open, setOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <Card
        ref={cardRef}
        sx={{
          '--Card-padding': '0px',
          pb: mobile ? 5 : 7,
          '&:not(:last-child)': {
            borderBottom: '1px solid var(--fortress-palette-brand-mono-300)',
          },
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: !mobile ? 8 : 0 }}>
          <ReviewLeftInfo review={review} switchToEdit={switchToEdit} />
          {mode === 'display' ? (
            <ReviewsRight review={review} />
          ) : (
            <ReviewForm
              defaultReview={review}
              onSubmit={handleSubmit}
              onCancel={switchToDisplay}
              isEditMode
              modal={modal}
            />
          )}
        </CardContent>
        {/* Castlery review */}
        {review.replies &&
          review.replies.length > 0 &&
          review.replies.map((reply) => (
            <Sheet key={reply.id} variant="solid" sx={{ width: '100%', padding: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                {/* <Typography level="h4">{reply.replied_by || 'Castlery'}</Typography> */}
                <Typography level="h4">replied</Typography>
                <Typography level="subh3" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
                  {formatDate(reply.updated_at)}
                </Typography>
              </Box>
              <Typography level="body2" sx={{ color: 'var(--fortress-palette-neutral-500)' }}>
                {reply.content}
              </Typography>
              <Box display={'flex'} gap={mobile ? 2 : 6} flexWrap={'wrap'} sx={{ mt: 3, maxWidth: '100%' }}>
                {reply?.attachments &&
                  reply?.attachments?.map((attachment, index) => (
                    <>
                      <FortressImage
                        key={index}
                        ratio={1}
                        objectFit={'cover'}
                        src={attachment?.url}
                        alt={'attachment'}
                        imageWidth={'120px'}
                        imageHeight={'120px'}
                        sx={{
                          cursor: 'zoom-in',
                        }}
                        onClick={() => {
                          setOpen(true);
                          setOpenIndex(index);
                        }}
                      />
                      <PinchZoomViewer
                        key={index}
                        open={open}
                        setOpen={setOpen}
                        slideImages={reply?.attachments?.map((item) => ({
                          src: item?.url,
                          alt: 'attachment',
                        }))}
                        index={openIndex}
                      />
                    </>
                  ))}
              </Box>
            </Sheet>
          ))}
      </Card>
    </>
  );
}
