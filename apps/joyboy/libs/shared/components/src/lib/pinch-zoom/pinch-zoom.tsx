'use client';

import { Box, Modal, Stack, useBreakpoints } from '@castlery/fortress';
import { DynamicModalDialog } from '@castlery/shared-fortress-client';
import { PinchZoomTooltip, WebClose, WebLeft, WebRight } from '@castlery/fortress/Icons';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Mousewheel, Navigation, Zoom } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FortressImage, FortressVideo } from '@castlery/shared-components';
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
  /**
   * 是否有多张图片叠加展示
   */
  overLayList?: string[];
}

interface PinchZoomProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  slideImages: SlideData[];
  index: number;
}

export function PinchZoom(props: PinchZoomProps) {
  const { open, setOpen, slideImages, index } = props;
  const [currentIndex, setCurrentIndex] = useState(index);
  const swiperRef = useRef<any>(null);
  const { desktop, mobile } = useBreakpoints();
  const pinchZoomTooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (pinchZoomTooltipRef.current) {
        pinchZoomTooltipRef.current.style.opacity = '0';
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  const handleClose = () => setOpen(false);

  const handleSlideChange = (swiper: any) => {
    // 在loop模式下，需要正确处理索引计算
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
      <DynamicModalDialog
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
            padding: desktop ? '5% 8%' : mobile ? '30% 0 44% 0' : '20% 0 24% 0',
          }}
        >
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            sx={{
              width: '100%',
              px: '16px',
              mb: '16px',
            }}
          >
            <WebClose
              onClick={handleClose}
              sx={{
                width: '40px',
                height: '40px',
              }}
            />
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
            {slideImages.map((slide, slideIndex) => (
              <SwiperSlide key={slideIndex}>
                <Box
                  className="swiper-zoom-container"
                  sx={{
                    '& .MuiAspectRatio-content': {
                      overflow: 'visible',
                    },
                  }}
                >
                  {slide.type === 'video' ? (
                    <FortressVideo
                      src={slide.src}
                      poster={slide.poster}
                      autoPlay={slide.autoPlay}
                      loop={slide.loop}
                      muted={slide.muted}
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
            ))}
          </Swiper>

          {slideImages.length > 1 && desktop && (
            <>
              <WebLeft
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
              />

              <WebRight
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
              />
            </>
          )}

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

          <Stack
            direction="row"
            justifyContent={'space-between'}
            alignItems="center"
            sx={{
              width: '100%',
              px: '16px',
              mt: '16px',
            }}
          >
            {slideImages.length > 1 && !desktop ? (
              <WebLeft
                sx={{
                  width: '40px',
                  height: '40px',
                }}
                onClick={() => {
                  swiperRef.current?.slidePrev();
                }}
              />
            ) : (
              <Box />
            )}
            <Stack
              sx={{
                height: desktop ? '28px' : '16px',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: desktop ? '14px' : '8px',
                padding: desktop ? '16px 48px' : '12px 24px',
                fontFamily: 'var(--font-minerva-modern)',
              }}
            >{`${currentIndex + 1} / ${slideImages?.length}`}</Stack>
            {slideImages.length > 1 && !desktop ? (
              <WebRight
                sx={{
                  width: '40px',
                  height: '40px',
                }}
                onClick={() => {
                  swiperRef.current?.slideNext();
                }}
              />
            ) : (
              <Box />
            )}
          </Stack>
        </Stack>
      </DynamicModalDialog>
    </Modal>
  );
}

export default PinchZoom;
