'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Box,
  DialogTitle,
  Divider,
  Drawer,
  Icons,
  Link,
  ModalClose,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { MappedSocialUgcItem } from '@castlery/modules-product-domain';
import { FortressImage, FortressVideo } from '@castlery/shared-components';
import { DynamicDialogContent } from '@castlery/shared-fortress-client';
import { generateVideoThumbnail, useScrollLock } from '@castlery/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Slider from 'react-slick';
import { useSlickAutoScrollDot } from '../../image-gallery/hooks/use-slick-auto-scroll-dot';
import SocialUgcVariantCarousel from './social-ugc-variant-carousel';

interface SocialUgcDrawerProps {
  open: boolean;
  onClose: () => void;
  ugcData: MappedSocialUgcItem[];
  initialIndex?: number; // 初始显示的 socialUgc 索引
  useInStoryblok?: boolean;
}

function MediaDisplay({ socialUgc }: { socialUgc: MappedSocialUgcItem }) {
  if (socialUgc.fileType === 'video') {
    return (
      <FortressVideo
        src={socialUgc?.media}
        autoPauseOnVisible={true}
        thumbnailConfig={{
          thumbnailStartOffset: socialUgc?.startOffset,
        }}
        id={`social-ugc-video-${socialUgc._uid}`}
      />
    );
  }
  return (
    <FortressImage
      src={socialUgc?.media}
      ratio={1}
      alt={'Shop Castlery Instagram'}
      objectFit="cover"
      sizes={['1-md', '1-sm', '1-xs']}
    />
  );
}

// 主要轮播组件
function MainCarousel({
  ugcData,
  initialIndex = 0,
  onSlideChange,
}: {
  ugcData: MappedSocialUgcItem[];
  initialIndex?: number;
  onSlideChange: (index: number) => void;
}) {
  const sliderRef = useRef<Slider>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const ugcThumbnail = useMemo(() => {
    return ugcData?.map((ugc) => {
      if (ugc?.fileType === 'video') {
        return generateVideoThumbnail(ugc?.media, {
          thumbnailStartOffset: ugc?.startOffset || 0,
        });
      }
      return ugc?.media;
    });
  }, [ugcData]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 300,
    autoplay: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    initialSlide: initialIndex,
    afterChange: (current: number) => {
      onSlideChange(current);
    },
    dotsClass: 'slick-dots custom-thumb-dots',
    customPaging: (i: number) => (
      <Box
        sx={{
          width: 60,
          height: 60,
          cursor: 'pointer',
          borderRadius: 1,
          overflow: 'hidden',
          border: '2px solid transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: (theme) => theme.palette.primary[400],
          },
          position: 'relative',
        }}
        // onClick={() => onSlideChange(i)}
      >
        <FortressImage
          src={ugcThumbnail[i] || ''}
          ratio={1}
          alt={`Thumbnail ${i + 1}`}
          objectFit="cover"
          sx={{
            height: '100%',
            '--AspectRatio-paddingBottom': '0',
          }}
          sizes="60px"
        />
        {ugcData[i]?.fileType === 'video' && (
          <Icons.PlayWhite
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              '--fortress-icon-width': '32px',
              '--fortress-icon-height': '32px',
            }}
          />
        )}
      </Box>
    ),
  };
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current?.slickGoTo(initialIndex);
    }
  }, [initialIndex]);
  useSlickAutoScrollDot(galleryRef, initialIndex);
  return (
    <Stack
      ref={galleryRef}
      sx={{
        '.slick-slider': {
          touchAction: 'pan-y',
          userSelect: 'none',
          '& .slick-list': {
            overflowX: 'hidden',
            '& .slick-track': {
              display: 'flex',
              flexDirection: 'row',
            },
          },
        },

        '.custom-thumb-dots': {
          display: 'flex !important',
          alignItems: 'center',
          gap: 1,
          marginTop: 2,
          overflowX: 'auto',
          paddingInlineStart: 0,

          '& li': {
            width: 'auto',
            height: 'auto',
            margin: '0 4px',
            '&.slick-active div': {
              borderColor: (theme) => theme.palette.primary[500],
            },
            'list-style-type': 'none',
          },
        },
      }}
    >
      {ugcData.length > 1 && (
        <Slider ref={sliderRef} {...sliderSettings}>
          {ugcData.map((socialUgc, index) => (
            <Box key={index}>
              <MediaDisplay socialUgc={socialUgc} />
            </Box>
          ))}
        </Slider>
      )}
      {ugcData.length === 1 && (
        <Box>
          <MediaDisplay socialUgc={ugcData[0]} />
        </Box>
      )}
    </Stack>
  );
}

export const SocialUgcDrawer = ({
  open,
  onClose,
  ugcData,
  initialIndex = 0,
  useInStoryblok = false,
}: SocialUgcDrawerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (open && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [open, hasLoaded]);

  const currentSocialUgc = useMemo(() => ugcData[currentIndex], [ugcData, currentIndex]);

  const { displayContent, shouldShowReadMore } = useMemo(() => {
    const content = currentSocialUgc?.content || '';
    const shouldShowReadMore = content?.length >= 200;
    const displayContent = shouldShowReadMore && !isExpanded ? content?.slice(0, 200) + '...' : content;

    return { displayContent, shouldShowReadMore };
  }, [currentSocialUgc?.content, isExpanded]);

  const handleToggleReadMore = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    setIsExpanded(false);
  }, [currentIndex]);

  const { mobile, tablet, desktop } = useBreakpoints();
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useScrollLock(open);

  if (!ugcData || ugcData.length === 0) return null;

  const handleSlideChange = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      sx={(theme) => ({
        // maxHeight: '90vh',
        '--Drawer-verticalSize': '85vh',
        '--Drawer-titleMargin': 0,
        bgcolor: 'rgba(0, 0, 0, 0.50)',
        ...(useInStoryblok && {
          '.MuiDrawer-content': {
            // height: '100vh',
            borderTopLeftRadius: '0',
            borderTopRightRadius: '0',
            paddingLeft: '16px',
            paddingRight: '16px',
            '> button': {
              display: 'none',
            },
          },
        }),
      })}
      disableScrollLock={true}
    >
      <>
        <DialogTitle
          component={Box}
          sx={(theme) => ({
            margin: `${theme.spacing(4)} 0 ${theme.spacing(4)} ${theme.spacing(6)}`,
            ...(useInStoryblok && {
              margin: '32px 0',
            }),
          })}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ pr: 6, width: '100%' }}>
            <Icons.Instagram sx={{ color: '#323433', flexShrink: 0 }} />
            <Divider orientation="vertical" sx={{ mx: '8px !important', backgroundColor: '#323433', flexShrink: 0 }} />
            <Typography
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              level="subh1"
            >
              {currentSocialUgc?.ig_handle}
            </Typography>
            <Box
              sx={{
                width: '24px',
                height: 'auto',
              }}
            />
            <ModalClose />
          </Stack>
        </DialogTitle>
        <DynamicDialogContent>
          {hasLoaded && (
            <>
              <Stack
                sx={(theme) => ({
                  px: mobile ? theme.spacing(6) : tablet ? theme.spacing(36) : undefined,
                  ...(useInStoryblok && {
                    px: '0 !important',
                  }),
                })}
              >
                <MainCarousel ugcData={ugcData} initialIndex={currentIndex} onSlideChange={handleSlideChange} />
              </Stack>

              <Stack
                sx={(theme) => ({
                  px: theme.spacing(6),
                  mb: '16px',
                  ...(useInStoryblok && {
                    px: '0 !important',
                  }),
                })}
                alignItems={'flex-start'}
              >
                <Typography level="body1">{displayContent}</Typography>
                {shouldShowReadMore && (
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      marginTop: '8px',
                      ...(useInStoryblok && {
                        button: {
                          color: '#A45B37',
                        },
                      }),
                    }}
                  >
                    <Link
                      component="button"
                      level="caption1"
                      variant="primary"
                      onClick={handleToggleReadMore}
                      endDecorator={isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                    >
                      {isExpanded ? 'Show Less' : 'Read More'}
                    </Link>
                  </Stack>
                )}
              </Stack>

              <Stack
                sx={(theme) => ({
                  px: mobile ? theme.spacing(6) : tablet ? theme.spacing(26) : undefined,
                  mb: theme.spacing(8),
                  ...(useInStoryblok && {
                    px: '0 !important',
                    mb: '0 !important',
                  }),
                })}
              >
                <SocialUgcVariantCarousel
                  useInStoryblok={useInStoryblok}
                  ugcListIndex={currentIndex}
                  socialUgc={currentSocialUgc}
                  onVariantSelect={() => {}}
                />
              </Stack>
            </>
          )}
        </DynamicDialogContent>
      </>
    </Drawer>
  );
};
