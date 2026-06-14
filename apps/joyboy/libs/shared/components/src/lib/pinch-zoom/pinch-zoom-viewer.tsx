'use client';

import { Box, IconButton, Modal, ModalDialog, Sheet, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowLeft, ArrowRight, Close, PinchZoomTooltip } from '@castlery/fortress/Icons';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Mousewheel, Navigation, Zoom } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FortressImage, FortressVideo } from '@castlery/shared-components';
import { useDelayedCallback } from '@castlery/modules-tracking-components';
import { EVENT_PDP_IMAGE_5S } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';

// Swiper 样式
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
// 定义 slide 数据类型
interface SlideData {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  /**
   * check if there are multiple images overlay
   */
  overLayList?: string[];
  /**
   * check if dimension is available
   */
  dimensionAvailable?: boolean;
  /**
   * attributes for tracking
   */
  assetType?: string;
  assetPosition?: number | string;
}

interface PinchZoomViewerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  slideImages: SlideData[];
  index: number;
  enabledTrackSlider?: boolean;
}

export function PinchZoomViewer({
  open,
  setOpen,
  slideImages,
  index,
  enabledTrackSlider = false,
}: PinchZoomViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(index);
  const swiperRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, any>>(new Map());
  const { desktop, mobile } = useBreakpoints();
  const pinchZoomTooltipRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (pinchZoomTooltipRef.current) {
        pinchZoomTooltipRef.current.style.opacity = '0';
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [open]);

  useDelayedCallback(
    currentIndex,
    async (val) => {
      const currentSlide = slideImages[val];
      if (!currentSlide) return;
      await dispatch(
        EVENT_PDP_IMAGE_5S({
          assetPosition: currentSlide.assetPosition ?? val + 1,
          assetType: currentSlide.assetType ?? '',
        })
      );
    },
    5000,
    enabledTrackSlider && open
  );

  // useEffect(() => {
  //   if (open) {
  //     const currentSlide = slideImages[currentIndex];
  //     if (currentSlide?.type === 'video') {
  //       setTimeout(() => {
  //         const currentVideo = videoRefs.current.get(currentIndex);
  //         if (currentVideo) {
  //           const showPreview = currentVideo.state?.showPreview;
  //           if (showPreview) {
  //             currentVideo.handleClickPreview?.();
  //           } else {
  //             const internalPlayer = currentVideo.getInternalPlayer?.();
  //             if (internalPlayer && typeof internalPlayer.play === 'function') {
  //               internalPlayer.play();
  //             }
  //           }
  //         }
  //       }, 100);
  //     }
  //   }
  // }, [open, currentIndex, slideImages]);

  if (!open) return null;

  const handleClose = () => setOpen(false);

  const handleSlideChange = (swiper: any) => {
    const realIndex = swiper.realIndex;
    setCurrentIndex(realIndex);
    const currentSlide = slideImages[realIndex];

    if (currentSlide?.overLayList && currentSlide?.overLayList?.length > 0) {
      swiper.zoom.disable();
    } else {
      swiper.zoom.enable();
    }
  };

  const handleZoomStart = () => {
    if (pinchZoomTooltipRef.current) {
      pinchZoomTooltipRef.current.style.opacity = '0';
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiModalDialog-root': {
          '--Card-padding': 0,
        },
      }}
    >
      <ModalDialog
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.50)',
        }}
      >
        {/* Swiper 主体 */}
        <Stack
          alignItems={'center'}
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            padding: desktop ? '2% 8%' : mobile ? '30% 0 44% 0' : '20% 0 24% 0',
          }}
          ref={containerRef}
        >
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            sx={{
              width: '100%',
              px: 4,
              mb: 4,
            }}
          >
            <IconButton
              variant="image"
              onClick={handleClose}
              sx={{
                '--Icon-fontSize': '40px',
              }}
            >
              <Close />
            </IconButton>
          </Stack>
          <Swiper
            modules={[Navigation, Zoom, Keyboard, Mousewheel]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            direction="horizontal"
            speed={300}
            zoom={{
              maxRatio: 3,
              minRatio: 1,
              toggle: true,
              containerClass: 'swiper-zoom-container',
              zoomedSlideClass: 'swiper-slide-zoomed',
            }}
            keyboard={{
              enabled: true,
              onlyInViewport: false,
            }}
            mousewheel={{
              forceToAxis: true,
              sensitivity: 1,
              invert: false,
            }}
            onSlideChange={handleSlideChange}
            onSwiper={(swiper) => {
              swiper.slideTo(index, 0);
              setCurrentIndex(index);
              swiperRef.current = swiper;

              const handleZoomChange = (swiper: any) => {
                if (swiper.zoom.enabled) {
                  handleZoomStart();
                }
              };

              swiper.on('zoomChange', handleZoomChange);

              return () => {
                swiper.off('zoomChange', handleZoomChange);
              };
            }}
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {slideImages.map((slide, slideIndex) => {
              if (slide?.type === 'video') {
                if (slide?.controls === undefined) {
                  slide.controls = true;
                }
                if (slide?.muted === undefined) {
                  slide.muted = true;
                }
              }
              return (
                <SwiperSlide key={slide.src + slideIndex}>
                  <Box
                    className={'swiper-zoom-container'}
                    sx={{
                      '& .MuiAspectRatio-content': {
                        overflow: 'visible',
                      },
                    }}
                  >
                    {slide.type === 'video' ? (
                      <FortressVideo
                        ref={(ref) => {
                          if (ref) {
                            videoRefs.current.set(slideIndex, ref);
                          }
                        }}
                        src={slide.src}
                        poster={slide.poster}
                        autoPlay={slide.autoPlay}
                        loop={slide.loop}
                        muted={slide.muted}
                        videoConfig={{
                          ac: slide.muted && !slide.controls,
                        }}
                        controls={slide.controls}
                        autoPauseOnVisible={true}
                        autoPlayOnVisible={true}
                        thumbnailConfig={{
                          thumbnailCrop: 'fit',
                          thumbnailQuality: 'best',
                        }}
                        sx={{
                          height: '100%',
                          paddingBottom: 0,
                        }}
                      />
                    ) : (
                      <>
                        <FortressImage
                          src={slide.src}
                          alt={slide.alt || `Image ${slideIndex + 1}`}
                          draggable={false}
                          sx={{
                            height: '100%',
                            '--AspectRatio-paddingBottom': 0,
                          }}
                        />
                        {slide?.overLayList &&
                          slide?.overLayList?.length > 0 &&
                          slide?.overLayList?.map((item, index) => {
                            return (
                              <FortressImage
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  zIndex: index + 10,
                                  height: '100%',
                                  '--AspectRatio-paddingBottom': 0,
                                }}
                                key={item + index}
                                draggable={false}
                                src={item}
                                alt=""
                              />
                            );
                          })}
                      </>
                    )}
                  </Box>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {slideImages.length > 1 && desktop && (
            <>
              <IconButton
                variant="image"
                sx={{
                  position: 'absolute',
                  left: '32px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                }}
                onClick={() => {
                  swiperRef.current?.slidePrev();
                }}
              >
                <ArrowLeft />
              </IconButton>

              <IconButton
                variant="image"
                sx={{
                  position: 'absolute',
                  right: '32px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                }}
                onClick={() => {
                  swiperRef.current?.slideNext();
                }}
              >
                <ArrowRight />
              </IconButton>
            </>
          )}

          {!desktop && (
            <Box
              ref={pinchZoomTooltipRef}
              sx={{
                position: 'absolute',
                bottom: desktop ? '10%' : '30%',
                left: '50%',
                translate: '-50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'opacity 1s ease-out',
                zIndex: 1,
              }}
            >
              <PinchZoomTooltip
                viewBox="0 0 215 48"
                sx={{
                  width: '215px',
                  height: '48px',
                }}
              />
            </Box>
          )}

          <Stack
            direction="row"
            justifyContent={'space-between'}
            alignItems="center"
            sx={{
              width: '100%',
              px: 4,
              mt: 4,
            }}
          >
            {slideImages.length > 1 && !desktop ? (
              <IconButton
                variant="image"
                sx={{
                  width: '40px',
                  height: '40px',
                }}
                onClick={() => {
                  swiperRef.current?.slidePrev();
                }}
              >
                <ArrowLeft />
              </IconButton>
            ) : (
              <Box />
            )}
            <Sheet
              variant="solid"
              sx={{
                px: 3,
                py: 2,
              }}
            >
              <Typography level="h4">{`${currentIndex + 1} / ${slideImages.length}`}</Typography>
            </Sheet>
            {slideImages.length > 1 && !desktop ? (
              <IconButton
                variant="image"
                sx={{
                  width: '40px',
                  height: '40px',
                }}
                onClick={() => {
                  swiperRef.current?.slideNext();
                }}
              >
                <ArrowRight />
              </IconButton>
            ) : (
              <Box />
            )}
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

export default PinchZoomViewer;
