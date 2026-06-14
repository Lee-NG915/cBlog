'use client';

import { Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { getReviewSummary } from '@castlery/modules-product-domain';
import { EVENT_CUSTOMER_REVIEW_IMPRESSION, EVENT_GENERAL_LINK_CLICK } from '@castlery/modules-tracking-services';
import { Rating } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import React, { useEffect, useRef, useState } from 'react';

const getReviewSummarySelect = () => getReviewSummary.select();

interface CustomerReviewProps {
  isFooterFullyVisible: boolean;
}

const CustomerReview = ({ isFooterFullyVisible }: CustomerReviewProps) => {
  const dispatch = useAppDispatch();
  const { desktop } = useBreakpoints();
  const { data: reviewSummaryData, status: reviewSummaryStatus } = useAppSelector(getReviewSummarySelect());
  const [opacity, setOpacity] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 'auto', height: 'auto' });
  const [position, setPosition] = useState({ left: 0, bottom: 0 });
  const animationRef = useRef<number | null>(null);

  // 仅当 store 中尚未有数据时才请求，避免每个页面/layout 重挂载都重复拉接口
  useEffect(() => {
    if (reviewSummaryStatus === 'uninitialized') {
      dispatch(getReviewSummary.initiate());
    }
  }, [dispatch, reviewSummaryStatus]);

  const loading = reviewSummaryStatus !== 'fulfilled';
  const rating = reviewSummaryData?.review_rating ?? 0;
  const reviewCount = reviewSummaryData?.review_count ?? 0;

  useEffect(() => {
    if (!loading) {
      dispatch(EVENT_CUSTOMER_REVIEW_IMPRESSION({ action: 'impression', label: 'review_widget' }));
    }
  }, [dispatch, loading]);

  // 处理动画效果
  useEffect(() => {
    // 清除之前的动画
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (isFooterFullyVisible) {
      // Footer 100% 可见时的动画
      // 0.25s 内 opacity 从 1 变到 0
      const startTime = performance.now();
      const animateOpacity = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / 250, 1); // 250ms = 0.25s
        const newOpacity = 1 - progress;
        setOpacity(newOpacity);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateOpacity);
        } else {
          // opacity 动画完成后，开始尺寸和位置动画
          const dimensionStartTime = performance.now();
          const animateDimensions = (currentTime: number) => {
            const dimensionElapsed = currentTime - dimensionStartTime;
            const dimensionProgress = Math.min(dimensionElapsed / 50, 1); // 50ms = 0.05s (0.25s-0.3s)
            if (dimensionProgress < 1) {
              setDimensions({ width: '0px', height: '0px' });
              // 同时移出可视窗口
              setPosition({ left: -200, bottom: -200 });
              animationRef.current = requestAnimationFrame(animateDimensions);
            }
          };
          animationRef.current = requestAnimationFrame(animateDimensions);
        }
      };
      animationRef.current = requestAnimationFrame(animateOpacity);
    } else {
      // Footer 不是 100% 可见时的动画
      // 先恢复位置和尺寸 (0.05s)
      const startTime = performance.now();
      const animateRestore = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / 50, 1); // 50ms = 0.05s
        if (progress < 1) {
          setDimensions({ width: 'auto', height: 'auto' });
          // 恢复原始位置
          setPosition({ left: 0, bottom: 0 });
          animationRef.current = requestAnimationFrame(animateRestore);
        } else {
          // 位置和尺寸恢复后，开始 opacity 动画 (0.05s-0.3s)
          const opacityStartTime = performance.now();
          const animateOpacity = (currentTime: number) => {
            const opacityElapsed = currentTime - opacityStartTime;
            const opacityProgress = Math.min(opacityElapsed / 250, 1); // 250ms = 0.25s
            const newOpacity = opacityProgress;
            setOpacity(newOpacity);

            if (opacityProgress < 1) {
              animationRef.current = requestAnimationFrame(animateOpacity);
            }
          };
          animationRef.current = requestAnimationFrame(animateOpacity);
        }
      };
      animationRef.current = requestAnimationFrame(animateRestore);
    }

    // 清理函数
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isFooterFullyVisible]);

  if (loading || !desktop) {
    return null;
  }
  return (
    <Link
      sx={(theme: any) => ({
        position: 'fixed',
        left: position.left,
        bottom: position.bottom,
        zIndex: 999,
        background: theme.palette.brand.warmLinen[200],
        color: theme.palette.brand.maroonVelvet[500],
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '4px',
        alignItems: 'center',
        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.15)',
        padding: '8px 12px',
        textDecoration: 'none',
        opacity: opacity,
        width: dimensions.width,
        height: dimensions.height,
        overflow: 'hidden',
        transition: 'none', // 禁用 CSS transition，使用 JavaScript 动画
        pointerEvents: opacity > 0.1 ? 'auto' : 'none', // 当透明度很低时禁用点击
        '&:hover': {
          textDecoration: 'none',
          background: theme.palette.brand.warmLinen[200],
          color: theme.palette.brand.maroonVelvet[500],
        },
      })}
      target="_blank"
      href="https://www.trustpilot.com/review/www.castlery.com"
      rel="noopener"
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        dispatch(EVENT_GENERAL_LINK_CLICK({ category: 'Trustpilot', label: 'click', link: 'review_widget' }));
        window.setTimeout(() => {
          window.open('https://www.trustpilot.com/review/www.castlery.com', '_blank');
        }, 200);
      }}
    >
      <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.3 }}>
        <Typography
          sx={{
            fontSize: '14px !important',
            fontFamily: 'var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)',
            fontWeight: '400',
            lineHeight: '120%',
            letterSpacing: '-3%',
            mr: '4px',
          }}
        >
          Trustpilot Score
        </Typography>
        <Typography
          sx={{
            fontSize: '14px !important',
            fontFamily: 'var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)',
            fontWeight: '800',
            lineHeight: '120%',
            letterSpacing: '-3%',
          }}
        >
          {rating}
        </Typography>
      </Stack>
      <Rating
        rating={rating}
        margin={2}
        size={20}
        innerType="outline"
        innerColor={'#844025'}
        outerColor={'transparent'}
      />
      <Typography
        sx={{
          fontSize: '12px !important',
          fontFamily: 'var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)',
          fontWeight: '400',
          lineHeight: '120%',
          mr: '4px',
        }}
      >
        Based on{' '}
        <Typography
          sx={{
            fontSize: '12px !important',
            fontFamily: 'var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)',
            fontWeight: '800',
            lineHeight: '120%',
          }}
        >
          {`${Number(reviewCount).toLocaleString()} reviews`}
        </Typography>
      </Typography>
    </Link>
  );
};

export { CustomerReview };
export default CustomerReview;
