'use client';

import { Button, Container, IconButton, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { FortressImage, ScrollWrapper } from '@castlery/shared-components';
import { ReviewImageItem } from '@castlery/modules-product-domain';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { parseReviewsDate } from '@castlery/utils';
import { ArrowLeft, ArrowRight, Close } from '@castlery/fortress/Icons';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_PDP_REVIEW_SECTION } from '@castlery/modules-tracking-services';

type ReviewImageGalleryProps = {
  onClose: () => void;
  open: boolean;
  review: ReviewImageItem;
  reviewImages: ReviewImageItem[];
  reviewImagesLoading?: boolean;
  reviewImagesLoadLocking?: boolean;
  onLoadMoreReviewImages?: () => void;
  onLoadPrevReviewImages?: () => void;
  clickedImageKey?: string;
  clickedImagePosition?: {
    currentPage: number;
    totalCount: number;
  } | null;
};

const ReviewImageGallery = ({
  onClose,
  open,
  review,
  reviewImages,
  reviewImagesLoading = false,
  reviewImagesLoadLocking = false,
  onLoadMoreReviewImages,
  onLoadPrevReviewImages,
  clickedImageKey,
  clickedImagePosition,
}: ReviewImageGalleryProps) => {
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const reviewImagesContainerRef = useRef<HTMLDivElement | null>(null);
  const reviewImageItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const onLoadMoreReviewImagesRef = useRef(onLoadMoreReviewImages);
  const onLoadPrevReviewImagesRef = useRef(onLoadPrevReviewImages);
  const reviewImagesLoadingRef = useRef(reviewImagesLoading);
  const reviewImagesNearBottomRef = useRef(false);
  const reviewImagesNearTopRef = useRef(false);
  const reviewImagesHasUserScrolledRef = useRef(false);
  const previousScrollOffsetRef = useRef(0);
  const initializedSelectedIndexRef = useRef(false);
  const initialLocatedAutoScrollDoneRef = useRef(false);
  const dispatch = useAppDispatch();
  const prependScrollAdjustRef = useRef<{
    pending: boolean;
    previousScrollHeight: number;
  }>({
    pending: false,
    previousScrollHeight: 0,
  });
  const appendAnchorAdjustRef = useRef<{
    pending: boolean;
    key: string | null;
    offset: number;
  }>({
    pending: false,
    key: null,
    offset: 0,
  });
  const pendingPrevArrowLoadRef = useRef<{
    pending: boolean;
    anchorKey: string | null;
  }>({
    pending: false,
    anchorKey: null,
  });
  const autoLoadPrevOnEnterDoneRef = useRef(false);
  const [reviewImageDisplay, setReviewImageDisplay] = useState<ReviewImageItem>();
  const [currentSelectedImageIndex, setCurrentSelectedImageIndex] = useState<number>(0);
  const [imageContainerSize, setImageContainerSize] = useState({ width: 0, height: 0 });

  const { desktop, tablet, mobile } = useBreakpoints();
  const reviewImagesPerPage = desktop ? 56 : 15;
  const totalReviewImageCount = clickedImagePosition?.totalCount || 0;
  const clampSelectedImageIndex = (index: number) => {
    if (totalReviewImageCount <= 0) return 0;
    return Math.min(Math.max(index, 0), totalReviewImageCount - 1);
  };
  const safeSelectedImageIndex = clampSelectedImageIndex(currentSelectedImageIndex);
  const isAtFirstImage = safeSelectedImageIndex <= 0;
  const isAtLastImage = totalReviewImageCount > 0 && safeSelectedImageIndex >= totalReviewImageCount - 1;

  useEffect(() => {
    if (!review) return;
    setReviewImageDisplay(review);
  }, [review]);

  useEffect(() => {
    initializedSelectedIndexRef.current = false;
    initialLocatedAutoScrollDoneRef.current = false;
    autoLoadPrevOnEnterDoneRef.current = false;
  }, [clickedImageKey, clickedImagePosition?.currentPage, open]);

  useEffect(() => {
    if (!open || !clickedImagePosition || initializedSelectedIndexRef.current) return;

    const tempIndex = reviewImages.findIndex((image) => image.key === clickedImageKey);
    if (tempIndex < 0) return;

    const nextSelectedIndex = tempIndex + (clickedImagePosition.currentPage - 1) * reviewImagesPerPage;
    setCurrentSelectedImageIndex(clampSelectedImageIndex(nextSelectedIndex));
    initializedSelectedIndexRef.current = true;
  }, [clickedImageKey, clickedImagePosition, open, reviewImages, reviewImagesPerPage, totalReviewImageCount]);

  useEffect(() => {
    if (!open) return;

    const { body, documentElement } = document;
    const scrollY = window.scrollY;

    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;
    const prevBodyOverscrollBehaviorY = body.style.overscrollBehaviorY;
    const prevHtmlOverscrollBehaviorY = documentElement.style.overscrollBehaviorY;
    const prevHtmlScrollBehavior = documentElement.style.scrollBehavior;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overscrollBehaviorY = 'none';
    documentElement.style.overscrollBehaviorY = 'none';

    return () => {
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      body.style.overscrollBehaviorY = prevBodyOverscrollBehaviorY;
      documentElement.style.overscrollBehaviorY = prevHtmlOverscrollBehaviorY;
      // Force non-smooth restore to avoid visible jump from top.
      documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
      documentElement.style.scrollBehavior = prevHtmlScrollBehavior;
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !imageContainerRef.current) return;

    const element = imageContainerRef.current;
    const updateSize = () => {
      setImageContainerSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [open]);

  const squareSize = useMemo(() => {
    const size = Math.min(imageContainerSize.width, imageContainerSize.height);
    return size > 0 ? Math.floor(size) : undefined;
  }, [imageContainerSize.height, imageContainerSize.width]);
  const thumbnailSize = 78;
  const thumbnailGap = 8;
  const preloadRows = 2;
  const preloadThreshold = (thumbnailSize + thumbnailGap) * preloadRows;
  const scrollThumbnailIntoView = (container: HTMLDivElement, selectedItem: HTMLDivElement) => {
    if (desktop) {
      const targetScrollLeft = selectedItem.offsetLeft - (container.clientWidth - selectedItem.clientWidth) / 2;
      const targetScrollTop = selectedItem.offsetTop - (container.clientHeight - selectedItem.clientHeight) / 2;

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      });
      return;
    }

    selectedItem.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  };

  const handleClickPrev = () => {
    if (!reviewImageDisplay) return;
    const index = reviewImages.findIndex((image) => image.key === reviewImageDisplay.key);
    if (index === 0) {
      const canLoadPrevByArrow =
        currentSelectedImageIndex > 0 &&
        !!onLoadPrevReviewImagesRef.current &&
        !reviewImagesLoadingRef.current &&
        !reviewImagesLoadLocking;

      if (canLoadPrevByArrow && !pendingPrevArrowLoadRef.current.pending) {
        pendingPrevArrowLoadRef.current = {
          pending: true,
          anchorKey: reviewImageDisplay.key,
        };
        onLoadPrevReviewImagesRef.current?.();
      }
      return;
    }
    setReviewImageDisplay(reviewImages[index - 1]);
    dispatch(
      EVENT_PDP_REVIEW_SECTION({
        action: 'click',
        label: 'gallery_arrow',
        tag: 'image_id',
        tagValue: reviewImages[index - 1].key,
      })
    );
    setCurrentSelectedImageIndex((prev) => prev - 1);
  };
  const handleClickNext = () => {
    if (!reviewImageDisplay) return;
    const index = reviewImages.findIndex((image) => image.key === reviewImageDisplay.key);
    if (index === reviewImages.length - 1) return;
    setReviewImageDisplay(reviewImages[index + 1]);
    dispatch(
      EVENT_PDP_REVIEW_SECTION({
        action: 'click',
        label: 'gallery_arrow',
        tag: 'image_id',
        tagValue: reviewImages[index + 1].key,
      })
    );
    setCurrentSelectedImageIndex((prev) => prev + 1);
  };
  const handleThumbnailClick = (image: ReviewImageItem) => {
    dispatch(
      EVENT_PDP_REVIEW_SECTION({ action: 'click', label: 'gallery_thumbnail', tag: 'image_id', tagValue: image.key })
    );
    setReviewImageDisplay(image);
    const nextLocalIndex = reviewImages.findIndex((i) => i.key === image.key);
    if (nextLocalIndex < 0) return;

    const currentLocalIndex = reviewImageDisplay ? reviewImages.findIndex((i) => i.key === reviewImageDisplay.key) : -1;
    if (currentLocalIndex >= 0) {
      setCurrentSelectedImageIndex((prev) => prev + (nextLocalIndex - currentLocalIndex));
      return;
    }

    const initialPageOffset = ((clickedImagePosition?.currentPage ?? 1) - 1) * reviewImagesPerPage;
    setCurrentSelectedImageIndex(initialPageOffset + nextLocalIndex);
  };

  useEffect(() => {
    onLoadMoreReviewImagesRef.current = onLoadMoreReviewImages;
  }, [onLoadMoreReviewImages]);

  useEffect(() => {
    onLoadPrevReviewImagesRef.current = onLoadPrevReviewImages;
  }, [onLoadPrevReviewImages]);

  useEffect(() => {
    reviewImagesLoadingRef.current = reviewImagesLoading;
  }, [reviewImagesLoading]);

  useEffect(() => {
    if (!open || !clickedImagePosition || autoLoadPrevOnEnterDoneRef.current) {
      return;
    }
    if (!onLoadPrevReviewImagesRef.current || reviewImagesLoadLocking || reviewImagesLoadingRef.current) {
      return;
    }

    const totalPages = Math.max(1, Math.ceil(totalReviewImageCount / reviewImagesPerPage));
    const isLastPage = clickedImagePosition.currentPage >= totalPages;
    const hasPreviousPage = clickedImagePosition.currentPage > 1;

    if (!isLastPage || !hasPreviousPage) {
      autoLoadPrevOnEnterDoneRef.current = true;
      return;
    }

    autoLoadPrevOnEnterDoneRef.current = true;
    prependScrollAdjustRef.current = {
      pending: true,
      previousScrollHeight: desktop
        ? reviewImagesContainerRef.current?.scrollHeight ?? 0
        : reviewImagesContainerRef.current?.scrollWidth ?? 0,
    };
    onLoadPrevReviewImagesRef.current();
  }, [clickedImagePosition, desktop, open, reviewImagesLoadLocking, reviewImagesPerPage, totalReviewImageCount]);

  useEffect(() => {
    reviewImagesNearBottomRef.current = false;
    reviewImagesNearTopRef.current = false;
    reviewImagesHasUserScrolledRef.current = false;
    previousScrollOffsetRef.current = 0;
    prependScrollAdjustRef.current = {
      pending: false,
      previousScrollHeight: 0,
    };
    appendAnchorAdjustRef.current = {
      pending: false,
      key: null,
      offset: 0,
    };
  }, [open, review?.key]);

  useEffect(() => {
    if (!open || !reviewImagesContainerRef.current) {
      return;
    }

    reviewImagesNearBottomRef.current = false;
    reviewImagesNearTopRef.current = false;
    const container = reviewImagesContainerRef.current;
    previousScrollOffsetRef.current = desktop ? container.scrollTop : container.scrollLeft;

    const evaluateLoad = (scrollDelta: number) => {
      if (reviewImagesLoadLocking) {
        return;
      }
      if (!reviewImagesHasUserScrolledRef.current) {
        return;
      }
      const remainingDistance = desktop
        ? container.scrollHeight - container.scrollTop - container.clientHeight
        : container.scrollWidth - container.scrollLeft - container.clientWidth;
      const isScrollingForward = scrollDelta > 0;
      const isScrollingBackward = scrollDelta < 0;
      const shouldLoadMore =
        !!onLoadMoreReviewImagesRef.current && remainingDistance <= preloadThreshold && isScrollingForward;
      const shouldLoadPrev =
        !!onLoadPrevReviewImagesRef.current &&
        (desktop ? container.scrollTop : container.scrollLeft) <= preloadThreshold &&
        isScrollingBackward;

      if (shouldLoadPrev) {
        if (!reviewImagesNearTopRef.current && !reviewImagesLoadingRef.current) {
          reviewImagesNearTopRef.current = true;
          prependScrollAdjustRef.current = {
            pending: true,
            previousScrollHeight: desktop ? container.scrollHeight : container.scrollWidth,
          };
          onLoadPrevReviewImagesRef.current?.();
        }
        return;
      }
      reviewImagesNearTopRef.current = false;

      if (shouldLoadMore) {
        if (!reviewImagesNearBottomRef.current && !reviewImagesLoadingRef.current) {
          reviewImagesNearBottomRef.current = true;
          const selectedKey = reviewImageDisplay?.key ?? null;
          const selectedItem = selectedKey ? reviewImageItemRefs.current[selectedKey] : null;
          appendAnchorAdjustRef.current = {
            pending: !!selectedItem && !!selectedKey,
            key: selectedKey,
            offset: selectedItem
              ? desktop
                ? selectedItem.offsetTop - container.scrollTop
                : selectedItem.offsetLeft - container.scrollLeft
              : 0,
          };
          onLoadMoreReviewImagesRef.current?.();
        }
        return;
      }

      reviewImagesNearBottomRef.current = false;
    };

    const handleScroll = () => {
      const currentOffset = desktop ? container.scrollTop : container.scrollLeft;
      const scrollDelta = currentOffset - previousScrollOffsetRef.current;
      previousScrollOffsetRef.current = currentOffset;
      reviewImagesHasUserScrolledRef.current = true;
      evaluateLoad(scrollDelta);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [desktop, open, preloadThreshold, reviewImageDisplay?.key, reviewImages.length, reviewImagesLoadLocking]);

  useLayoutEffect(() => {
    if (!open || !reviewImagesContainerRef.current) {
      return;
    }
    if (!prependScrollAdjustRef.current.pending) {
      return;
    }

    const container = reviewImagesContainerRef.current;
    const scrollDistanceDiff = desktop
      ? container.scrollHeight - prependScrollAdjustRef.current.previousScrollHeight
      : container.scrollWidth - prependScrollAdjustRef.current.previousScrollHeight;
    if (scrollDistanceDiff > 0) {
      if (desktop) {
        container.scrollTop += scrollDistanceDiff;
      } else {
        container.scrollLeft += scrollDistanceDiff;
      }
    }
    prependScrollAdjustRef.current.pending = false;
  }, [desktop, open, reviewImages.length]);

  useLayoutEffect(() => {
    if (!open || !reviewImagesContainerRef.current) {
      return;
    }
    const appendAdjust = appendAnchorAdjustRef.current;
    if (!appendAdjust.pending || !appendAdjust.key) {
      return;
    }

    const container = reviewImagesContainerRef.current;
    const anchorItem = reviewImageItemRefs.current[appendAdjust.key];
    if (!anchorItem) {
      appendAnchorAdjustRef.current.pending = false;
      return;
    }

    const currentOffset = desktop
      ? anchorItem.offsetTop - container.scrollTop
      : anchorItem.offsetLeft - container.scrollLeft;
    const offsetDiff = currentOffset - appendAdjust.offset;
    if (offsetDiff !== 0) {
      if (desktop) {
        container.scrollTop += offsetDiff;
      } else {
        container.scrollLeft += offsetDiff;
      }
    }
    appendAnchorAdjustRef.current.pending = false;
  }, [desktop, open, reviewImages.length]);

  useLayoutEffect(() => {
    if (!open || !reviewImageDisplay?.key) {
      return;
    }
    const container = reviewImagesContainerRef.current;
    const selectedItem = reviewImageItemRefs.current[reviewImageDisplay.key];
    if (!container || !selectedItem) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = selectedItem.getBoundingClientRect();
    const isOutOfView =
      itemRect.left < containerRect.left ||
      itemRect.right > containerRect.right ||
      itemRect.top < containerRect.top ||
      itemRect.bottom > containerRect.bottom;

    if (!isOutOfView) {
      return;
    }

    scrollThumbnailIntoView(container, selectedItem);
  }, [desktop, open, reviewImageDisplay?.key]);

  useEffect(() => {
    if (!open || !pendingPrevArrowLoadRef.current.pending) {
      return;
    }

    const { anchorKey } = pendingPrevArrowLoadRef.current;
    if (!anchorKey || reviewImages.length === 0) {
      return;
    }

    const anchorIndex = reviewImages.findIndex((image) => image.key === anchorKey);
    if (anchorIndex > 0) {
      const targetImage = reviewImages[anchorIndex - 1];
      setReviewImageDisplay(targetImage);
      setCurrentSelectedImageIndex((prev) => Math.max(0, prev - 1));
      dispatch(
        EVENT_PDP_REVIEW_SECTION({
          action: 'click',
          label: 'gallery_arrow',
          tag: 'image_id',
          tagValue: targetImage.key,
        })
      );
      pendingPrevArrowLoadRef.current = {
        pending: false,
        anchorKey: null,
      };
      return;
    }

    if (!reviewImagesLoading && !reviewImagesLoadLocking) {
      pendingPrevArrowLoadRef.current = {
        pending: false,
        anchorKey: null,
      };
    }
  }, [dispatch, open, reviewImages, reviewImagesLoading, reviewImagesLoadLocking]);

  useLayoutEffect(() => {
    if (!open || initialLocatedAutoScrollDoneRef.current || reviewImagesHasUserScrolledRef.current) {
      return;
    }

    const container = reviewImagesContainerRef.current;
    const targetKey = reviewImageDisplay?.key ?? clickedImageKey;
    const selectedItem = targetKey ? reviewImageItemRefs.current[targetKey] : null;
    if (!container || !selectedItem) {
      return;
    }

    scrollThumbnailIntoView(container, selectedItem);
    initialLocatedAutoScrollDoneRef.current = true;
  }, [clickedImageKey, desktop, open, reviewImageDisplay?.key, reviewImages.length]);

  if (!open || !review) return null;
  if (desktop) {
    return (
      <Stack
        sx={(theme) => ({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.brand.warmLinen[500],
          zIndex: 1002,
          justifyContent: 'center',
        })}
      >
        <Container disableGutters>
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              height: '780px',
              maxHeight: '100vh',
            }}
          >
            <Stack
              sx={{
                width: '60%',
                minWidth: '60%',
                maxWidth: '60%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <Stack
                ref={imageContainerRef}
                sx={{
                  flex: 8,
                  minHeight: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {!!squareSize && !!reviewImageDisplay?.url && (
                  <FortressImage
                    src={reviewImageDisplay?.url}
                    objectFit="cover"
                    ratio={1}
                    imageWidth={squareSize}
                    imageHeight={squareSize}
                    alt={`review image`}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  />
                )}
              </Stack>
              <Stack
                sx={(theme) => ({
                  flex: 2,
                  minHeight: 0,
                  padding: `${theme.spacing(6)} ${theme.spacing(8)}  ${theme.spacing(6)} ${theme.spacing(4)}`,
                })}
              >
                <Stack
                  sx={(theme) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: theme.spacing(3),
                  })}
                >
                  <Typography level="h4">{reviewImageDisplay?.title}</Typography>
                  <Typography
                    level="subh3"
                    sx={{
                      color: 'var(--fortress-palette-brand-mono-700)',
                      ml: '24px',
                      minWidth: '100px',
                    }}
                  >
                    {reviewImageDisplay?.review_date
                      ? parseReviewsDate(reviewImageDisplay?.review_date)?.toUpperCase()
                      : ''}
                  </Typography>
                </Stack>
                <Typography
                  level="body2"
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 4,
                    lineHeight: '24px',
                    maxHeight: '96px',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {reviewImageDisplay?.content}
                </Typography>
              </Stack>
            </Stack>
            <Stack
              sx={(theme) => ({
                position: 'relative',
                width: '40%',
                minWidth: '40%',
                maxWidth: '40%',
                padding: `${theme.spacing(6)} ${theme.spacing(8)} ${theme.spacing(16)} ${theme.spacing(8)}`,
              })}
            >
              <Typography level="body1" sx={(theme) => ({ mb: theme.spacing(4) })}>
                Tap any image for a closer look
              </Typography>
              <Stack
                ref={reviewImagesContainerRef}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: '8px',
                  overflow: 'auto',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  padding: '8px',
                }}
              >
                {reviewImages.map((image) => (
                  <Stack
                    key={image.key}
                    ref={(node) => {
                      reviewImageItemRefs.current[image.key] = node;
                    }}
                    sx={{ position: 'relative' }}
                  >
                    <FortressImage
                      key={image.key}
                      src={image.url}
                      alt={image.title}
                      objectFit="cover"
                      ratio={1}
                      imageWidth={78}
                      imageHeight={78}
                      onClick={() => handleThumbnailClick(image)}
                      sx={{
                        cursor: 'pointer',
                      }}
                    />
                    {reviewImageDisplay?.key === image.key && (
                      <Stack
                        sx={{
                          position: 'absolute',
                          top: '-6px',
                          left: '-6px',
                          right: '-6px',
                          bottom: '-6px',
                          border: '4px solid #D25C1B',
                        }}
                      />
                    )}
                  </Stack>
                ))}
              </Stack>
              <Stack
                sx={{
                  position: 'absolute',
                  bottom: '24px',
                  height: '85px',
                  padding: '40px 32px 0 32px',
                  backgroundColor: '#F6F3E7',
                  left: 0,
                  right: 0,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack direction="row" gap={3}>
                  <IconButton
                    variant="image"
                    aria-label="Previous UGC"
                    title="Previous UGC"
                    disabled={isAtFirstImage}
                    sx={{
                      '--IconButton-size': '40px',
                      '&.Mui-disabled': {
                        opacity: 0.4,
                      },
                    }}
                    onClick={handleClickPrev}
                  >
                    <ArrowLeft />
                  </IconButton>
                  <IconButton
                    variant="image"
                    aria-label="Next UGC"
                    title="Next UGC"
                    disabled={isAtLastImage}
                    sx={{
                      '--IconButton-size': '40px',
                      '&.Mui-disabled': {
                        opacity: 0.4,
                      },
                    }}
                    onClick={handleClickNext}
                  >
                    <ArrowRight />
                  </IconButton>
                </Stack>
                <Typography level="caption1">
                  {safeSelectedImageIndex + 1} / {clickedImagePosition?.totalCount || 0}
                </Typography>
                <Button
                  variant="plain"
                  size="md"
                  onClick={onClose}
                  sx={(theme) => ({
                    color: theme.palette.brand.burntOrange[500],
                    '&:hover': {
                      color: theme.palette.brand.terracotta[500],
                    },
                  })}
                >
                  <Typography level="subh2">CLOSE</Typography>
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Stack>
    );
  }
  return (
    <Stack
      sx={(theme) => ({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.palette.brand.warmLinen[500],
        zIndex: 1002,
        justifyContent: 'flex-start',
        overflowY: 'auto',
        height: '100dvh',
        overscrollBehaviorY: 'contain',
        WebkitOverflowScrolling: 'touch',
        pb: theme.spacing(8),
        alignItems: 'center',
      })}
    >
      <Stack
        sx={(theme) => ({
          width: '100%',
          minHeight: theme.spacing(14),
          backgroundColor: theme.palette.brand.warmLinen[200],
          position: 'relative',
        })}
      >
        <Close
          onClick={onClose}
          sx={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)' }}
        />
      </Stack>
      <Stack sx={{ width: '100%', ...(tablet && { width: '480px' }) }}>
        <Stack
          sx={(theme) => ({
            position: 'relative',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            mb: theme.spacing(3),
          })}
        >
          {!!reviewImageDisplay?.url && (
            <FortressImage
              src={reviewImageDisplay?.url}
              objectFit="cover"
              imageWidth={tablet ? 480 : undefined}
              imageHeight={480}
              alt="review image"
              sx={{
                width: tablet ? '480px' : '100%',
                height: '480px',
                maxWidth: '100%',
                margin: '0 auto',
              }}
            />
          )}
          <Stack direction="row" gap={3} sx={{ position: 'absolute', bottom: '16px', right: '16px' }}>
            <IconButton
              variant="image"
              aria-label="Previous UGC"
              title="Previous UGC"
              disabled={isAtFirstImage}
              sx={{
                '--IconButton-size': '24px',
                maxWidth: '24px !important',
                maxHeight: '24px !important',
                '&.Mui-disabled': {
                  opacity: 0.4,
                },
              }}
              onClick={handleClickPrev}
            >
              <ArrowLeft sx={{ width: '14px', height: '14px' }} />
            </IconButton>
            <IconButton
              variant="image"
              aria-label="Next UGC"
              title="Next UGC"
              disabled={isAtLastImage}
              sx={{
                '--IconButton-size': '24px',
                maxWidth: '24px !important',
                maxHeight: '24px !important',
                '&.Mui-disabled': {
                  opacity: 0.4,
                },
              }}
              onClick={handleClickNext}
            >
              <ArrowRight sx={{ width: '14px', height: '14px' }} />
            </IconButton>
          </Stack>
        </Stack>
        <ScrollWrapper
          scrollContainerRef={reviewImagesContainerRef}
          hideTrack={false}
          hideDesktopAction={true}
          hideBottomAction={true}
          sx={{ pb: 1, pt: 0, minHeight: '70px', ...(mobile && { paddingLeft: 2 }) }}
          scrollTrackHeight={8}
        >
          <Stack direction="row" gap={1} sx={{ width: 'max-content' }}>
            {reviewImages.map((image) => (
              <Stack
                key={image.key}
                ref={(node) => {
                  reviewImageItemRefs.current[image.key] = node;
                }}
                sx={{ position: 'relative' }}
              >
                <FortressImage
                  src={image.url}
                  alt={image.title}
                  objectFit="cover"
                  ratio={1}
                  imageWidth={60}
                  imageHeight={60}
                  onClick={() => handleThumbnailClick(image)}
                  sx={{
                    cursor: 'pointer',
                  }}
                />
                {reviewImageDisplay?.key === image.key && (
                  <Stack
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      border: '3px solid #D25C1B',
                    }}
                  />
                )}
              </Stack>
            ))}
          </Stack>
        </ScrollWrapper>
      </Stack>
      <Stack
        sx={(theme) => ({
          width: '100%',
          padding: `${theme.spacing(6)} ${theme.spacing(4)}`,
        })}
      >
        <Stack
          sx={(theme) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(3),
          })}
        >
          <Typography level="h4">{reviewImageDisplay?.title}</Typography>
          <Typography
            level="subh3"
            sx={{
              color: 'var(--fortress-palette-brand-mono-700)',
            }}
          >
            {reviewImageDisplay?.review_date ? parseReviewsDate(reviewImageDisplay?.review_date)?.toUpperCase() : ''}
          </Typography>
        </Stack>
        <Typography level="body2" sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {reviewImageDisplay?.content}
        </Typography>
      </Stack>
      <Stack
        sx={(theme) => ({
          position: 'fixed',
          bottom: '0',
          left: 0,
          right: 0,
          height: '36px',
          alignItems: 'center',
          backgroundColor: theme.palette.brand.warmLinen[500],
        })}
      >
        <Typography level="caption1" sx={{ width: 'fit-content', ...(tablet && { fontSize: '14px !important' }) }}>
          {safeSelectedImageIndex + 1} / {clickedImagePosition?.totalCount || 0}
        </Typography>
      </Stack>
    </Stack>
  );
};

export { ReviewImageGallery };
