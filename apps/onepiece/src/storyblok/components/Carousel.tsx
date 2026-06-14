import React, { useRef, useState } from 'react';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import { Stack, Box, useTheme } from '@castlery/fortress';
import Slider from 'react-slick';
import { ArrowRight, ArrowLeft } from '@castlery/fortress/Icons';
import CustomScrollbar from 'components/CustomScrollbar';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useAnchorScroll } from '../hooks/anchor';

export type CarouselProps = {
  blok: {
    _uid?: string;
    items?: Array<{
      _uid: string;
      image: [];
      video: [];
    }>;
    anchor_link?: string;
  };
  sliderSettings: {
    slidesToShow?: number;
  };
  widthPercentage?: string;
  trackStyleType?: string;
  hideTrack?: boolean;
};

const Carousel = ({ blok, sliderSettings, widthPercentage, trackStyleType = 'primary', hideTrack }: CarouselProps) => {
  const { _uid, items = [], anchor_link } = blok;
  const { slidesToShow = 3 } = sliderSettings || {};
  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });
  const { desktop } = useBreakpoints();

  const filterItems = items.filter((item) => item.image.length > 0 || item.video.length > 0);
  const sliderRef = useRef(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const allowClickPrev = slideIndex !== 0;
  const allowClickNext = Math.ceil(slideIndex) < filterItems.length - Math.floor(slidesToShow);

  const basicTheme = useTheme();
  const sliderStyleSetting = {
    primary: {
      handle: {
        backgroundColor: basicTheme.palette.brand.terracotta[500],
      },
      track: {
        backgroundColor: basicTheme.palette.brand.wheat[500],
      },
      arrow: {
        active: {
          fill: basicTheme.palette.brand.wheat[500],
        },
        inActive: {
          fill: basicTheme.palette.brand.charcoal[400],
        },
      },
    },
    mono: {
      handle: {
        backgroundColor: basicTheme.palette.brand.charcoal[800],
      },
      track: {
        backgroundColor: basicTheme.palette.brand.charcoal[500],
      },
      arrow: {
        active: {
          fill: basicTheme.palette.brand.terracotta[500],
        },
        inActive: {
          fill: basicTheme.palette.brand.charcoal[400],
        },
      },
    },
  };

  const settings = {
    arrows: false,
    dots: true,
    infinite: false,
    lazyLoad: true,
    speed: 300,
    slidesToShow,
    slidesToScroll: 1,
    beforeChange: (oldIndex: number, newIndex: number) => {
      setSlideIndex(newIndex);
    },
    appendDots: (dots: any) => (
      <Stack
        sx={(theme) => ({
          '&.slick-dots': {
            position: 'relative',
            width: '100%',
            maxWidth: '1440px',
            mt: theme.spacing(3),
            [theme.breakpoints.down('xl')]: {
              px: '30px',
            },
            li: {
              height: '1px',
              position: 'relative',
              flex: 1,
              listStyle: 'none',
              width: '100%',
              ...sliderStyleSetting[trackStyleType].track,
              '&.slick-active': {
                button: {
                  opacity: 1,
                },
              },
              [`:nth-of-type(${Math.ceil(slideIndex + 1)})`]: {
                button: {
                  opacity: 1,
                },
              },
              button: {
                position: 'absolute',
                height: '8px',
                opacity: 0,
                left: '50%',
                top: '50%',
                fontSize: 0,
                padding: 0,
                border: 0,
                transform: 'translate(-50%, -50%)',
                width: '100%',
                ...sliderStyleSetting[trackStyleType].handle,
                ':before': {
                  backgroundColor: 'transparent',
                },
              },
            },
          },
        })}
      >
        <Stack
          component="ul"
          flexDirection="row"
          sx={() => ({
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
          })}
        >
          {dots}
          {desktop && (
            <Box
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing(6),
                ml: theme.spacing(8),
              })}
            >
              <Stack
                sx={(theme) => ({
                  cursor: 'pointer',
                  ...sliderStyleSetting[trackStyleType].arrow.active,
                  ...(!allowClickPrev && {
                    cursor: 'not-allowed',
                    ...sliderStyleSetting[trackStyleType].arrow.inActive,
                  }),
                })}
                onClick={() => {
                  if (allowClickPrev) {
                    sliderRef.current?.slickPrev();
                  }
                }}
              >
                <ArrowLeft
                  fontSize="xl5"
                  sx={(theme) => ({
                    cursor: 'pointer',
                    ...sliderStyleSetting[trackStyleType].arrow.active,
                    ...(!allowClickPrev && {
                      cursor: 'not-allowed',
                      ...sliderStyleSetting[trackStyleType].arrow.inActive,
                    }),
                  })}
                  onClick={() => {
                    if (allowClickPrev) {
                      sliderRef.current?.slickPrev();
                    }
                  }}
                />
              </Stack>
              <Stack
                sx={(theme) => ({
                  cursor: 'pointer',
                  ...sliderStyleSetting[trackStyleType].arrow.active,
                  ...(!allowClickNext && {
                    cursor: 'not-allowed',
                    ...sliderStyleSetting[trackStyleType].arrow.inActive,
                  }),
                })}
                onClick={() => {
                  if (allowClickNext) {
                    sliderRef.current?.slickNext();
                  }
                }}
              >
                <ArrowRight
                  fontSize="xl5"
                  sx={(theme) => ({
                    cursor: 'pointer',
                    ...sliderStyleSetting[trackStyleType].arrow.active,
                    ...(!allowClickNext && {
                      cursor: 'not-allowed',
                      ...sliderStyleSetting[trackStyleType].arrow.inActive,
                    }),
                  })}
                  onClick={() => {
                    if (allowClickNext) {
                      sliderRef.current?.slickNext();
                    }
                  }}
                />
              </Stack>
            </Box>
          )}
        </Stack>
      </Stack>
    ),
    ...sliderSettings,
  };

  if (filterItems.length === 0) {
    return null;
  }

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      ref={blokRef}
      id={anchor_link?.slice(1)}
      sx={(theme) => ({
        maxWidth: '1440px',
        width: '100%',
        mx: 'auto',
        ...(desktop &&
          slidesToShow > 1 && {
            ...(slidesToShow === filterItems.length
              ? {
                  px: '30px',
                  [theme.breakpoints.up('xl')]: {
                    px: 0,
                  },
                }
              : {
                  '.slick-list': {
                    ...(slideIndex === 0 && {
                      [theme.breakpoints.down('xl')]: {
                        pl: '30px',
                      },
                    }),
                    ...(!allowClickNext && {
                      [theme.breakpoints.down('xl')]: {
                        right: '22px',
                      },
                    }),
                  },
                }),
          }),
        '.slick-track': {
          display: 'flex',
          flexDirection: 'row',
          gap: slidesToShow > 1 && theme.spacing(1),
          '&:before, &:after': {
            content: '""',
            display: 'none',
          },
        },
      })}
    >
      {desktop ? (
        <Slider ref={sliderRef} {...settings}>
          {filterItems.map((nestedBlok, index) => (
            <Stack
              key={index}
              sx={() => ({
                position: 'relative',
              })}
            >
              <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} isNested />
            </Stack>
          ))}
        </Slider>
      ) : (
        <CustomScrollbar
          content={
            <Stack
              flexDirection="row"
              sx={(theme) => ({
                gap: theme.spacing(1),
                '> div': {
                  width: widthPercentage,
                  flexShrink: 0,
                  ':first-of-type, :last-of-type': {
                    width: theme.spacing(1),
                  },
                },
              })}
            >
              <Box />
              {filterItems.map((nestedBlok) => (
                <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} isNested />
              ))}
              <Box />
            </Stack>
          }
          type="storyblok"
          hideTrack={hideTrack}
        />
      )}
    </Stack>
  );
};

export { Carousel };
