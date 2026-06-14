'use client';

import { Box, Sheet, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import {
  UspVariantDataStoryblok,
  UspVariantDStoryblok,
  UspSelectorStoryblok,
  DataBucketStoryblok,
} from '@castlery/types';
import { useEffect, useMemo, useState } from 'react';
import { Media } from '../../media';
import { ISbStoryData } from '@storyblok/react/dist/types';
import { PinchZoomViewer } from '@castlery/shared-components';
import { EVENT_USP_IMPRESSION } from '@castlery/modules-tracking-services';
import { useInViewDelayedCallback } from '@castlery/modules-tracking-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { ThemeSchema } from '@castlery/fortress/Theme/types/Theme';
import { Controller, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/mousewheel';
import 'swiper/css/controller';

export interface RefinedUspVariantDProps {
  blok: UspVariantDStoryblok;
  content: ISbStoryData<DataBucketStoryblok>['content'] | undefined;
}

const PROGRESS_BAR_WIDTH_NON_DESKTOP = 278;
const PROGRESS_SEGMENT_HEIGHT = 68;

export function RefinedUspVariantD(props: RefinedUspVariantDProps) {
  const { blok, content } = props;
  const dispatch = useAppDispatch();
  const { enableBuiltData, title, description, media, link } = blok;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);
  const [textSwiper, setTextSwiper] = useState<SwiperType | null>(null);
  const [imageSwiper, setImageSwiper] = useState<SwiperType | null>(null);
  const [imageSwiperContainer, setImageSwiperContainer] = useState<Element | null>(null);
  const { desktop, tablet } = useBreakpoints();

  const uspData = useMemo(() => content?.uspData, [content?.uspData]);
  const uspVariantD = useMemo(() => {
    const raw = content?.uspVariantD;
    return Array.isArray(raw) ? (raw as UspSelectorStoryblok[]) : undefined;
  }, [content?.uspVariantD]);

  const uspRef = useInViewDelayedCallback(
    async () => {
      dispatch(EVENT_USP_IMPRESSION({ uspVariant: 'usp_variant_d' }));
    },
    3000,
    { threshold: 0.6 }
  );

  const variantData: UspVariantDataStoryblok[] | undefined = useMemo(() => {
    if (!enableBuiltData) {
      const singleItem: UspVariantDataStoryblok = {
        title: title?.[0]?.value ?? '',
        description: description?.[0]?.value ?? '',
        media: media?.[0]?.data,
        link: link?.[0]?.link,
      };
      return [singleItem];
    }
    if (!uspData || !uspVariantD || uspVariantD.length < 1) return undefined;
    return uspVariantD
      .filter((item): item is typeof item & { dataIndex: string } => !!item?.dataIndex)
      .map((item) => uspData[Number(item.dataIndex) - 1])
      .filter((item): item is UspVariantDataStoryblok => !!item);
  }, [description, enableBuiltData, link, media, title, uspData, uspVariantD]);

  useEffect(() => {
    setCurrentIndex(0);
    textSwiper?.slideTo(0, 0);
  }, [variantData, textSwiper]);

  const totalItems = variantData?.length ?? 0;

  const progressInnerWidth =
    totalItems > 0 ? PROGRESS_BAR_WIDTH_NON_DESKTOP / totalItems : PROGRESS_BAR_WIDTH_NON_DESKTOP;
  const progressOffset = currentIndex * progressInnerWidth;

  if (!variantData) return null;

  return (
    <>
      <Sheet variant="solid" ref={uspRef} sx={{ position: 'relative' }}>
        {desktop ? (
          <Stack
            direction="row"
            px={15}
            py={15}
            alignItems="stretch"
            sx={{ aspectRatio: '12/5', position: 'relative' }}
          >
            {/* Clickable vertical progress bar segments */}
            <Box
              sx={(theme: ThemeSchema) => ({
                position: 'absolute',
                left: theme.spacing(15),
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(2),
                zIndex: 2,
              })}
            >
              {variantData.map((_, i) => (
                <Box
                  key={i}
                  onClick={() => textSwiper?.slideTo(i)}
                  sx={(theme: ThemeSchema) => ({
                    width: '4px',
                    height: `${PROGRESS_SEGMENT_HEIGHT}px`,
                    borderRadius: theme.spacing(2),
                    backgroundColor:
                      i === currentIndex ? theme.palette.brand.terracotta[500] : theme.palette.brand.warmLinen[600],
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                  })}
                />
              ))}
            </Box>
            {/* Left: text Swiper */}
            <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }}>
              <Swiper
                direction="vertical"
                slidesPerView={1}
                spaceBetween={0}
                autoplay={false}
                modules={[Controller, Mousewheel]}
                controller={{ control: imageSwiper || undefined }}
                mousewheel={{ forceToAxis: true, sensitivity: 1, releaseOnEdges: false, thresholdTime: 500 }}
                onSwiper={setTextSwiper}
                onSlideChange={(swiper: SwiperType) => setCurrentIndex(swiper.realIndex)}
                style={{ height: '100%' }}
              >
                {variantData.map((item, index) => (
                  <SwiperSlide key={item?._uid || index}>
                    <Stack
                      justifyContent="center"
                      alignItems="flex-start"
                      gap={3}
                      sx={{ height: '100%', pl: 15, pr: 12 }}
                    >
                      <Typography
                        level={blok?.title?.[0]?.level || 'h3'}
                        sx={{
                          textAlign: 'left',
                          wordBreak: 'break-word',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item?.title}
                      </Typography>
                      <Typography
                        level={blok?.description?.[0]?.level || 'body1'}
                        sx={{
                          color: 'var(--fortress-palette-brand-maroonVelvet-500)',
                          textAlign: 'left',
                          wordBreak: 'break-word',
                          padding: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item?.description}
                      </Typography>
                    </Stack>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
            {/* Right: image Swiper — primary interaction driver */}
            <Box ref={setImageSwiperContainer} sx={{ flex: 1, minWidth: 0, overflow: 'hidden', height: '100%' }}>
              <Swiper
                direction="vertical"
                slidesPerView={1}
                spaceBetween={0}
                autoplay={false}
                modules={[Controller, Mousewheel]}
                controller={{ control: textSwiper || undefined }}
                mousewheel={{ forceToAxis: true, sensitivity: 1, releaseOnEdges: false, thresholdTime: 500 }}
                onSwiper={setImageSwiper}
                style={{ height: '100%' }}
              >
                {variantData.map((item, index) => (
                  <SwiperSlide key={item?._uid || index}>
                    <Box sx={{ height: '100%', overflow: 'hidden', pl: 15 }}>
                      <Media
                        media_url={item.media?.filename}
                        ratio={600 / 480}
                        {...{
                          onClick: () => {
                            setOpenIndex(index);
                            setOpen(true);
                          },
                          controls: false,
                          videoConfig: { ac: true },
                          rootContainer: imageSwiperContainer,
                        }}
                      />
                    </Box>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
          </Stack>
        ) : (
          <Swiper
            slidesPerView={1}
            spaceBetween={0}
            speed={400}
            modules={[Mousewheel]}
            mousewheel={{
              forceToAxis: true,
              sensitivity: 1,
              releaseOnEdges: true,
            }}
            onSlideChange={(swiper: SwiperType) => setCurrentIndex(swiper.realIndex)}
          >
            {variantData.map((item, index) => (
              <SwiperSlide key={item?._uid || index}>
                <Stack direction="column" alignItems="stretch">
                  <Media
                    media_url={item.media?.filename}
                    ratio={1.25}
                    {...{
                      onClick: () => {
                        setOpenIndex(index);
                        setOpen(true);
                      },
                      controls: false,
                      videoConfig: { ac: true },
                    }}
                  />

                  <Stack gap={4} py={tablet ? 7 : 6} px={tablet ? 6 : 4} alignItems="center" justifyContent="center">
                    <Typography
                      level={blok?.title?.[0]?.level || 'h3'}
                      sx={{
                        textAlign: 'center',
                        wordBreak: 'break-word',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item?.title}
                    </Typography>
                    <Typography
                      level={blok?.description?.[0]?.level || 'body1'}
                      sx={{
                        color: 'var(--fortress-palette-brand-maroonVelvet-500)',
                        textAlign: 'center',
                        wordBreak: 'break-word',
                        padding: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item?.description}
                    </Typography>
                  </Stack>
                </Stack>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Mobile/Tablet progress bar */}
        {!desktop && (
          <Box
            sx={(theme: ThemeSchema) => ({
              display: 'flex',
              justifyContent: 'center',
              pb: theme.spacing(4),
            })}
          >
            <Box
              sx={(theme: ThemeSchema) => ({
                width: `${PROGRESS_BAR_WIDTH_NON_DESKTOP}px`,
                height: theme.spacing(1),
                backgroundColor: theme.palette.brand.warmLinen[600],
                borderRadius: theme.spacing(2),
                position: 'relative',
                overflow: 'hidden',
              })}
            >
              <Box
                sx={(theme: ThemeSchema) => ({
                  position: 'absolute',
                  top: 0,
                  left: `${progressOffset}px`,
                  width: `${progressInnerWidth}px`,
                  height: '100%',
                  backgroundColor: theme.palette.brand.terracotta[500],
                  borderRadius: theme.spacing(2),
                  transition: 'left 0.4s ease',
                })}
              />
            </Box>
          </Box>
        )}
      </Sheet>

      {variantData.length > 0 && (
        <PinchZoomViewer
          open={open}
          setOpen={setOpen}
          slideImages={variantData.map((item, index) => {
            const isVideo = item?.media?.content_type?.includes('video');
            return {
              type: isVideo ? 'video' : 'image',
              src: item?.media?.filename,
              alt: item?.media?.alt || `usp ${isVideo ? 'video' : 'image'}`,
              width: 100,
              height: 100,
              controls: false,
              assetType: item?.media?.content_type,
              assetPosition: index + 1,
            };
          })}
          index={openIndex}
        />
      )}
    </>
  );
}

export default RefinedUspVariantD;
