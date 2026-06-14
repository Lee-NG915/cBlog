/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { Modal, Stack, IconButton, Typography, Sheet, Icons, Divider } from '@castlery/fortress';
import { useCallback, useMemo, useState } from 'react';
import Slider from 'react-slick';
import { MappedSocialUgcItem } from '@castlery/modules-product-domain';
import { EVENT_SOCIAL_WIDGET } from '@castlery/modules-tracking-services';
import { FortressImage } from '@castlery/shared-components';
import { FortressVideo } from '@castlery/shared-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import SocialUgcVariantCarousel from './social-ugc-variant-carousel';
import { ArrowLeft, ArrowRight, Close } from '@castlery/fortress/Icons';
import { useScrollLock } from '@castlery/utils';

interface SocialUgcModalProps {
  open: boolean;
  onClose: () => void;
  ugcData: MappedSocialUgcItem[];
  initialIndex?: number;
  useInStoryblok?: boolean;
}

// 自定义箭头组件
function CustomPrevArrow({
  onClick,
  useInStoryblok,
  onTrackArrowClick,
}: {
  onClick?: () => void;
  useInStoryblok?: boolean;
  onTrackArrowClick?: () => void;
}) {
  const handleClick = () => {
    onTrackArrowClick?.();
    onClick?.();
  };

  return (
    <IconButton
      onClick={handleClick}
      variant="image"
      sx={{
        position: 'absolute',
        left: 'calc((100vw - 1078px) / 2 - 96px)',
        '@media (max-width: 1440px) and (min-width: 901px)': {
          left: 'calc((100vw - 900px) / 2 - 60px)',
        },
        top: '50%',
        zIndex: 1,
        transform: 'translateY(-50%)',
        '--Icon-fontSize': '40px',
        ...(useInStoryblok && {
          borderRadius: '50%',
          backgroundColor: '#fff',
          opacity: 0.7,
          '&:hover': {
            backgroundColor: '#fff',
            opacity: 1,
          },
        }),
      }}
    >
      <ArrowLeft
        sx={{
          width: 40,
          height: 40,
          ...(useInStoryblok && {
            width: '32px',
            height: '32px',
            fill: '#A45B37',
          }),
        }}
      />
    </IconButton>
  );
}

function CustomNextArrow({
  onClick,
  useInStoryblok,
  onTrackArrowClick,
}: {
  onClick?: () => void;
  useInStoryblok?: boolean;
  onTrackArrowClick?: () => void;
}) {
  const handleClick = () => {
    onTrackArrowClick?.();
    onClick?.();
  };

  return (
    <IconButton
      onClick={handleClick}
      variant="image"
      sx={{
        position: 'absolute',
        right: 'calc((100vw - 1078px) / 2 - 96px)',
        '@media (max-width: 1440px) and (min-width: 901px)': {
          right: 'calc((100vw - 900px) / 2 - 60px)',
        },
        top: '50%',
        zIndex: 1,
        transform: 'translateY(-50%)',
        '--Icon-fontSize': '40px',
        ...(useInStoryblok && {
          borderRadius: '50%',
          backgroundColor: '#fff',
          opacity: 0.7,
          '&:hover': {
            backgroundColor: '#fff',
            opacity: 1,
          },
        }),
      }}
    >
      <ArrowRight
        sx={{
          width: 40,
          height: 40,
          ...(useInStoryblok && {
            width: '32px',
            height: '32px',
            fill: '#A45B37',
          }),
        }}
      />
    </IconButton>
  );
}

// 单个滑块组件
function SocialUgcSlide({
  socialUgc,
  useInStoryblok,
  ugcListIndex,
  ...rest
}: {
  socialUgc: MappedSocialUgcItem;
  useInStoryblok?: boolean;
  ugcListIndex?: number;
}) {
  return (
    <Stack
      sx={{
        display: 'flex !important',
        flexDirection: 'row !important',
        justifyContent: 'center !important',
        alignItems: 'stretch !important',
        // aspectRatio: '1 / 0.555',
        backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
        // height: 'calc(100vw * 0.75 * 0.555)',
        height: '600px',
        width: '1078px !important',
        '@media (max-width: 1440px) and (min-width: 901px)': {
          width: '900px !important',
        },
        margin: 'auto',
        ...(useInStoryblok && {
          backgroundColor: '#fff',
        }),
      }}
      {...rest}
    >
      <Stack
        sx={{
          // width: '55.5%', // 1.25 / (1.25 + 1) ≈ 55.5%
          width: '600px',
          '@media (max-width: 1440px) and (min-width: 901px)': {
            width: '400px',
          },
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        <MediaDisplay socialUgc={socialUgc} />
      </Stack>
      <Sheet
        variant="soft"
        sx={(theme) => ({
          // width: '44.5%',
          width: '478px',
          '@media (max-width: 1440px) and (min-width: 901px)': {
            width: '500px',
          },
          flexShrink: 0,
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
          padding: `${theme.spacing(6)} ${theme.spacing(6)} ${theme.spacing(8)} ${theme.spacing(6)}`,
          ...(useInStoryblok && {
            padding: `${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(4)} ${theme.spacing(3)}`,
          }),
        })}
      >
        <Stack
          sx={{
            height: '100%',
          }}
        >
          <Stack direction={'row'} justifyContent={'flex-start'} alignItems={'center'} mb={useInStoryblok ? 3 : 6}>
            <Icons.Instagram
              sx={{
                '--fortress-icon-width': '32px',
                '--fortress-icon-height': '32px',
                color: 'var(--fortress-palette-brand-mono-900)',
              }}
            />
            <Divider
              orientation="vertical"
              sx={{
                mx: 4,
                ...(useInStoryblok && {
                  mx: '16px',
                  backgroundColor: '#323433',
                }),
              }}
            />
            <Typography level="subh2" variant="plain" sx={{ ...(useInStoryblok && { color: '#323433' }) }}>
              {socialUgc?.ig_handle}
            </Typography>
          </Stack>
          <Stack
            sx={(theme) => ({
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
              // ...theme?.mixins?.scrollbar?.default,
            })}
          >
            <Typography level="body2" variant="plain" sx={{ ...(useInStoryblok && { color: '#323433' }) }}>
              {socialUgc?.content}
            </Typography>
          </Stack>
          <Stack
            sx={{
              flex: '0 0 auto',
              marginTop: '20px',
            }}
            mt={2}
          >
            <SocialUgcVariantCarousel
              useInStoryblok={useInStoryblok}
              socialUgc={socialUgc}
              ugcListIndex={ugcListIndex}
              onVariantSelect={() => {}}
            />
          </Stack>
        </Stack>
      </Sheet>
    </Stack>
  );
}

function MediaDisplay({ socialUgc }: { socialUgc: MappedSocialUgcItem }) {
  if (socialUgc.fileType === 'video') {
    return (
      <FortressVideo
        src={socialUgc?.media}
        thumbnailConfig={{
          thumbnailStartOffset: socialUgc?.startOffset,
        }}
        autoPauseOnVisible={true}
        id={`social-ugc-video-${socialUgc._uid}`}
        sx={{
          height: '100%',
          paddingBottom: 0,
        }}
        muted={true}
        autoPlay={true}
        loop={true}
        autoPlayOnVisible={true}
        noNeedPoster={true}
      />
    );
  }
  return (
    <FortressImage
      src={socialUgc?.media}
      ratio={1}
      alt={'Shop Castlery Instagram'}
      objectFit="cover"
      sx={{
        height: '100%',
        '--AspectRatio-paddingBottom': 0,
      }}
      sizes={['0.4-md', '1-sm', '1-xs']}
    />
  );
}

export function SocialUgcModal({
  open,
  onClose,
  ugcData,
  initialIndex = 0,
  useInStoryblok = false,
}: SocialUgcModalProps) {
  const dispatch = useAppDispatch();
  const [currentSlide, setCurrentSlide] = useState(initialIndex);

  useScrollLock(open);

  const handleArrowClickTrack = useCallback(() => {
    dispatch(EVENT_SOCIAL_WIDGET({ action: 'arrow_click' }));
  }, [dispatch]);

  const sliderSettings = useMemo(
    () => ({
      infinite: true,
      speed: 300,
      slidesToShow: 1,
      slidesToScroll: 1,
      initialSlide: initialIndex,
      arrows: true,
      lazyLoad: 'ondemand' as const,
      prevArrow: <CustomPrevArrow useInStoryblok={useInStoryblok} onTrackArrowClick={handleArrowClickTrack} />,
      nextArrow: <CustomNextArrow useInStoryblok={useInStoryblok} onTrackArrowClick={handleArrowClickTrack} />,
      beforeChange: (current: number, next: number) => {
        setCurrentSlide(next);
      },
    }),
    [handleArrowClickTrack, initialIndex, useInStoryblok]
  );

  if (!ugcData || ugcData.length === 0) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.50)',
      }}
      disableScrollLock={true}
    >
      <Stack
        sx={{
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:focus-visible': {
            outline: 'none',
          },
        }}
      >
        <Stack
          sx={{
            width: '100%',
            position: 'relative',
            '.slick-slider': {
              width: '100%',
              touchAction: 'pan-y',
              userSelect: 'none',
              '&:focus-visible': {
                outline: 'none',
              },
              '& .slick-list': {
                '&:focus-visible': {
                  outline: 'none',
                },
                '& .slick-track': {
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  '&:focus-visible': {
                    outline: 'none',
                  },
                  '& .slick-slide': {
                    // padding: '0 calc(100vw * 0.125)',
                  },
                },
              },
            },
            '&:focus-visible': {
              outline: 'none',
            },
          }}
        >
          {ugcData.length > 1 && (
            <Slider {...sliderSettings}>
              {ugcData.map((item, index) => (
                <SocialUgcSlide
                  key={item._uid}
                  socialUgc={item}
                  useInStoryblok={useInStoryblok}
                  ugcListIndex={currentSlide + index}
                />
              ))}
            </Slider>
          )}
          {ugcData.length === 1 && (
            <SocialUgcSlide
              key={ugcData[0]._uid}
              socialUgc={ugcData[0]}
              useInStoryblok={useInStoryblok}
              ugcListIndex={currentSlide}
            />
          )}
        </Stack>

        <IconButton
          onClick={onClose}
          variant="image"
          sx={{
            position: 'absolute',
            top: 0,
            '@media (max-width: 1440px) and (min-width: 901px)': {
              right: 'calc((100vw - 900px) / 2 - 28px)',
            },
            right: 'calc((100vw - 1078px) / 2 - 28px)',
            transform: 'translateY(-50%)',
            zIndex: 2,
            '--Icon-fontSize': '40px',
            ...(useInStoryblok && {
              borderRadius: '50%',
              backgroundColor: '#fff',
              opacity: 0.7,
              minWidth: 40,
              maxWidth: 40,
              minHeight: 40,
              maxHeight: 40,
              padding: '0 !important',
              '&:hover': {
                backgroundColor: '#fff',
                opacity: 1,
              },
            }),
          }}
        >
          <Close
            sx={{
              width: 36,
              height: 36,
            }}
          />
        </IconButton>
      </Stack>
    </Modal>
  );
}

export default SocialUgcModal;
