'use client';

import {
  Box,
  DialogTitle,
  IconButton,
  Link,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { ArrowLeft, ArrowRight } from '@castlery/fortress/Icons';
import { Image, Product } from '@castlery/modules-product-domain';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDelayedCallback } from '@castlery/modules-tracking-components';
import { EVENT_PDP_IMAGE_5S } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ThumbnailImage } from '../refined/refined-product-gallery/components/thumbnail-image';
import {
  EnlargedGalleryTrackingPayload,
  EnlargedMediaVisibilityTracker,
} from './components/enlarged-media-visibility-tracker';
import { FreeMode, Mousewheel } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/mousewheel';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
const ENLARGED_VIEWER_TRACKING_DELAY = 5000;

interface ProductEnlargedGalleryViewerProps {
  open: boolean;
  onClose: () => void;
  galleryList: Image[];
  initialIndex: number;
  product: Product;
  renderMediaItem: (
    media: Image,
    index: number,
    isCurrent: boolean,
    renderContext: 'enlarged-desktop' | 'enlarged-mobile'
  ) => React.ReactNode;
  dimensionGrayImage?: string;
  getTrackingPayload?: (media: Image, index: number) => EnlargedGalleryTrackingPayload;
}

export const ProductEnlargedGalleryViewer = ({
  open,
  onClose,
  galleryList,
  initialIndex,
  product,
  renderMediaItem,
  dimensionGrayImage,
  getTrackingPayload,
}: ProductEnlargedGalleryViewerProps) => {
  const { desktop } = useBreakpoints();
  const dispatch = useAppDispatch();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const desktopSwiperRef = useRef<SwiperType | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [mobileScrollRoot, setMobileScrollRoot] = useState<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    setActiveIndex(initialIndex);

    if (desktop) {
      requestAnimationFrame(() => {
        desktopSwiperRef.current?.slideTo(initialIndex, 0);
      });
      return;
    }

    requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      const target = mobileItemRefs.current[initialIndex];
      if (container && target) {
        container.scrollTop = target.offsetTop;
      }
    });
  }, [desktop, initialIndex, open]);

  const handleTrackImage5S = useCallback(
    async (payload: EnlargedGalleryTrackingPayload) => {
      await dispatch(EVENT_PDP_IMAGE_5S(payload));
    },
    [dispatch]
  );

  useDelayedCallback(
    activeIndex,
    async (trackedIndex) => {
      const currentMedia = galleryList[trackedIndex];
      if (!currentMedia) return;

      const trackingPayload = getTrackingPayload?.(currentMedia, trackedIndex) ?? {
        assetPosition: trackedIndex + 1,
        assetType: currentMedia.type ?? '',
      };

      await handleTrackImage5S(trackingPayload);
    },
    ENLARGED_VIEWER_TRACKING_DELAY,
    desktop && open
  );

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog layout="fullscreen" sx={{ p: 0, borderRadius: 0 }}>
        <Sheet variant={desktop ? 'solid' : 'soft'}>
          {desktop ? (
            <Stack direction="row" height="100%" width="100%" minWidth={0}>
              <Stack data-testid="enlarged-gallery-stage" height="100dvh">
                <Swiper
                  data-testid="enlarged-gallery-swiper"
                  onSwiper={(swiper) => (desktopSwiperRef.current = swiper)}
                  initialSlide={initialIndex}
                  onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                  slidesPerView={1.1}
                  spaceBetween={0}
                  modules={[Mousewheel, FreeMode]}
                  mousewheel={{
                    forceToAxis: true,
                    sensitivity: 1,
                    releaseOnEdges: true,
                  }}
                  freeMode={{
                    enabled: true,
                    sticky: false,
                    momentumRatio: 1,
                    momentumVelocityRatio: 1,
                    momentumBounceRatio: 1,
                    minimumVelocity: 0.02,
                  }}
                  style={{
                    height: '100%',
                    aspectRatio: 1.1,
                  }}
                >
                  {galleryList.map((media, index) => (
                    <SwiperSlide key={`${media.type}-${index}`}>
                      {renderMediaItem(media, index, activeIndex === index, 'enlarged-desktop')}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Stack>
              <Stack
                px={7}
                py={6}
                gap={5}
                sx={{
                  height: '100dvh',
                  overflow: 'hidden',
                  flex: 1,
                  '@media (max-width: 1200px)': {
                    position: 'fixed',
                    right: 0,
                    backgroundColor: 'var(--fortress-palette-brand-warmLinen-500)',
                    zIndex: 1000,
                    width: '330px',
                  },
                }}
              >
                <Stack
                  flexDirection="row"
                  flexWrap="wrap"
                  gap={3}
                  alignContent="start"
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    p: 1,
                  }}
                >
                  {galleryList.map((media, index) => (
                    <Box
                      key={`${media.type}-thumb-${index}`}
                      onClick={() => {
                        setActiveIndex(index);
                        desktopSwiperRef.current?.slideTo(index);
                      }}
                      sx={{ cursor: 'pointer', width: 78, height: 78, flexShrink: 0 }}
                    >
                      <ThumbnailImage
                        media={media}
                        index={index}
                        product={product}
                        isActive={activeIndex === index}
                        dimensionGrayImage={dimensionGrayImage}
                        renderContext="enlarged-desktop"
                      />
                    </Box>
                  ))}
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0 }}>
                  <Stack direction="row" spacing={3}>
                    <IconButton
                      aria-label="Previous gallery item"
                      variant="image"
                      onClick={() => desktopSwiperRef.current?.slidePrev()}
                      disabled={activeIndex === 0}
                    >
                      <ArrowLeft />
                    </IconButton>
                    <IconButton
                      aria-label="Next gallery item"
                      variant="image"
                      onClick={() => desktopSwiperRef.current?.slideNext()}
                      disabled={activeIndex === galleryList.length - 1}
                    >
                      <ArrowRight />
                    </IconButton>
                  </Stack>
                  <Typography level="caption1" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>{`${
                    activeIndex + 1
                  }/${galleryList.length}`}</Typography>
                  <Link
                    component={'button'}
                    variant="primary"
                    onClick={onClose}
                    level="subh2"
                    sx={{ textDecoration: 'none' }}
                  >
                    Close
                  </Link>
                </Stack>
              </Stack>
            </Stack>
          ) : (
            <Stack direction="column" height="100dvh">
              <DialogTitle sx={{ py: 4, px: 6, m: 0 }}>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  sx={{
                    width: '100%',
                  }}
                >
                  <ModalClose
                    sx={(_theme) => ({
                      '&&.MuiModalClose-root': {
                        position: 'initial',
                      },
                    })}
                  />
                </Stack>
              </DialogTitle>
              <Box
                ref={(node) => {
                  const scrollNode = node as HTMLDivElement | null;
                  scrollContainerRef.current = scrollNode;
                  setMobileScrollRoot(scrollNode);
                }}
                sx={{ flex: 1, overflowY: 'auto' }}
              >
                <Stack spacing={0}>
                  {galleryList.map((media, index) => (
                    <EnlargedMediaVisibilityTracker
                      key={`${media.type}-mobile-${index}`}
                      active={open}
                      index={index}
                      media={media}
                      onTrack={handleTrackImage5S}
                      root={mobileScrollRoot}
                      resolveTrackingPayload={getTrackingPayload}
                      setNodeRef={(node) => {
                        mobileItemRefs.current[index] = node;
                      }}
                    >
                      <Box sx={{ aspectRatio: 1 }}>{renderMediaItem(media, index, true, 'enlarged-mobile')}</Box>
                    </EnlargedMediaVisibilityTracker>
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </Sheet>
      </ModalDialog>
    </Modal>
  );
};
