'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Link,
  Divider,
  Loading,
  useNiceModal,
  Stack,
  Breadcrumbs,
} from '@castlery/fortress';
import { AuthModal } from '@castlery/shared-components';
import { logger } from '@castlery/observability/client';
import {
  useGetReviewNeededItemsQuery,
  useSubmitReviewMutation,
  selectedActiveUser,
} from '@castlery/modules-user-domain';
import { SubmitReviewBannerContent, SubmitReviewBannerImage } from './submit-review-banner';
import { TrustpilotRedirectPrompt } from './trustpilot-redirect-prompt';
import { ReviewItem, SubmitReviewData } from '@castlery/types';
import { useBreakpoints } from '@castlery/fortress';
import ReviewLeftInfo from './review-left';
import ReviewForm from './reviews-form';
import { ReviewGuide } from './reviews-content';
import { NextFortressLink } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';

export function SubmitReviewContent() {
  const searchParams = useSearchParams();
  const shipmentId = searchParams.get('shipment');
  const orderNumber = searchParams.get('order');
  const user = useAppSelector(selectedActiveUser);
  const { mobile, desktop, tablet } = useBreakpoints();
  const [openAuthModal, setOpenAuthModal] = useState(!user ? true : false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [error, setError] = useState<string>('');
  const [submitReview] = useSubmitReviewMutation();
  const [modal, modalContextHolder] = useNiceModal();
  const [startJumpCountDown, setStartJumpCountDown] = useState(false);
  const [reviewIsFiveStar, setReviewIsFiveStar] = useState(false);
  const [allReviewsSubmitted, setAllReviewsSubmitted] = useState(false);
  const {
    data: reviewItems,
    isLoading,
    error: queryError,
    refetch: refetchReviewItems,
  } = useGetReviewNeededItemsQuery(
    { shipment_id: shipmentId ? parseInt(shipmentId) : undefined },
    { skip: !shipmentId }
  );

  const handleLoginSuccess = async () => {
    try {
      await refetchReviewItems();
    } catch (error) {
      logger.error('Failed to refetch review items after login', { error, shipmentId });
      setError('Failed to load review items');
    }
  };

  useEffect(() => {
    if (reviewItems && reviewItems.length > 0) {
      setItems(
        reviewItems.map(
          (item) =>
            ({
              id: item.id,
              variant: item.variant,
              order_number: item.order_number,
              rating: 0,
            } as unknown as ReviewItem)
        )
      );

      setError('');
    }
  }, [reviewItems]);

  useEffect(() => {
    if (queryError) {
      setError('Failed to load review items. Please try again.');
    }
  }, [queryError]);

  // 滚动到组件完全可见的工具函数
  const scrollToElementIntoView = (element: HTMLElement): Promise<void> => {
    return new Promise((resolve) => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (isVisible) {
        resolve();
        return;
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // 等待滚动完成
      const checkScrollEnd = () => {
        const newRect = element.getBoundingClientRect();
        const isNowVisible = newRect.top >= 0 && newRect.bottom <= window.innerHeight;

        if (isNowVisible) {
          resolve();
        } else {
          setTimeout(checkScrollEnd, 100);
        }
      };

      setTimeout(checkScrollEnd, 300);
    });
  };

  const handleItemFinish = async (data: SubmitReviewData) => {
    const { variant_code } = data.review;
    const selectItems = items.filter((item) => !(item.variant.sku === variant_code));
    try {
      const res = await submitReview({
        review: {
          ...data.review,
          order_number: orderNumber || undefined,
        },
      });
      if (res.error) {
        logger.error('Failed to submit review', {
          error: res.error,
          orderNumber,
          reviewData: data.review,
        });
      } else {
        const isLastItem = selectItems.length === 0;

        setItems(selectItems);

        if (isLastItem) {
          setReviewIsFiveStar(data.review.rating === 5);
          setAllReviewsSubmitted(true);
          navigator.clipboard.writeText(data.review.content);
        }

        if (bannerRef.current) {
          await scrollToElementIntoView(bannerRef.current);
        }

        modal.success({
          title: 'Review submitted!',
          desc:
            data.review.rating === 5
              ? 'Review status will be updated within 3 working days. Credits will be issued after approval. You can track your reviews under Account > Reviews.'
              : 'You will be notified of the status of your review within 3 working days. You will receive credits after the review is approved.',
          showCancelBtn: false,
          confirmText: 'OKAY',
          onConfirm: () => {
            if (isLastItem && data.review.rating === 5) {
              setStartJumpCountDown(true);
            }
          },
        });
      }
    } catch (error) {
      logger.error('Failed to submit review - unexpected error', {
        error,
        orderNumber,
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Loading theme="dark" />
        </Box>
      );
    }

    if (error) {
      return (
        <Stack
          gap={desktop ? 7 : 6}
          sx={{
            px: {
              xs: 4,
              md: 12,
            },
          }}
        >
          <SubmitReviewBannerContent />

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography level="h3">You are not allowed to perform that action.</Typography>
          </Box>
          <Divider />
          <ReviewGuide />
        </Stack>
      );
    }

    if (allReviewsSubmitted && items.length === 0) {
      return (
        <Stack gap={desktop ? 5 : 6}>
          <SubmitReviewBannerContent reviewIsFiveStar={reviewIsFiveStar} />
          {reviewIsFiveStar ? (
            <TrustpilotRedirectPrompt mobile={mobile} active={startJumpCountDown} />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography level="body1">
                You've reviewed all your purchased products. You can check them under{' '}
                <Link href="account/reviews">Reviews</Link>
              </Typography>
            </Box>
          )}
          <Divider />
          <ReviewGuide />
        </Stack>
      );
    }

    if (items.length !== 0) {
      return (
        <Stack gap={desktop ? 7 : 6}>
          <SubmitReviewBannerContent reviewIsFiveStar={reviewIsFiveStar} />
          <Divider />
          {items.map((item) => (
            <Card
              key={item.id}
              sx={{
                '--Card-padding': '0px',
                pb: mobile ? 10 : 7,
                borderBottom: '1px solid var(--fortress-palette-brand-mono-300)',
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: !mobile ? 8 : 0 }}>
                <ReviewLeftInfo review={item} switchToEdit={() => {}} isSubmitReview />
                <ReviewForm
                  defaultReview={item}
                  onSubmit={handleItemFinish}
                  onCancel={() => {}}
                  modal={modal}
                  isSubmitReview
                />
              </CardContent>
            </Card>
          ))}
          <ReviewGuide />
        </Stack>
      );
    }

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
        <Typography level="body1">There are no items to comment on </Typography>
        <Link href="account/orders">Back to Orders</Link>
      </Box>
    );
  };

  return (
    <>
      {modalContextHolder}
      <Container>
        <Breadcrumbs>
          <NextFortressLink
            level="caption1"
            variant="plain"
            sx={{
              marginInline: 0,
              textDecoration: 'none',
              color: 'var(--fortress-palette-brand-mono-700)',
              '&:hover': {
                color: 'var(--fortress-palette-brand-terracotta-500)',
                textDecoration: 'underline',
              },
            }}
          >
            Home
          </NextFortressLink>
          <Typography level="body2">Submit Review</Typography>
        </Breadcrumbs>
      </Container>
      <Box ref={bannerRef}>
        <SubmitReviewBannerImage mobile={mobile} tablet={tablet} reviewIsFiveStar={reviewIsFiveStar} />
      </Box>
      <Container sx={{ pb: mobile ? '36px' : '40px' }}>
        {renderContent()}
        <AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} onSuccess={handleLoginSuccess} />
      </Container>
    </>
  );
}
