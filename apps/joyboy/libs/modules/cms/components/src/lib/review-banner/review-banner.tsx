'use client';

import { Button, Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowLeft, ArrowRight } from '@castlery/fortress/Icons';
import Quote from '@castlery/fortress/Icons/svg/Quote';
import { DtStack } from '@castlery/modules-tracking-components';
import { Rating } from '@castlery/shared-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useCallback, useState } from 'react';
import { ImageOrVideo, RichTextTypography } from '../component-v1/components';
import { ImageProps } from '../component-v1/image';
import { VideoProps } from '../component-v1/video';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';

interface ReviewItemProps {
  author: string;
  author_color?: string;
  description: string;
  image: ImageProps[];
  rating: string;
  video: VideoProps[];
}

interface ReviewBannerProps {
  blok: {
    _uid: string;
    header: string;
    header_color: string;
    header_level: 'h1' | 'h2';
    background_color: string;
    button_background_color: string;
    button_text_color: string;
    items: ReviewItemProps[];
  };
}

const ReviewBanner = ({ blok }: ReviewBannerProps) => {
  const {
    header,
    header_color,
    header_level,
    background_color,
    button_background_color,
    button_text_color,
    items,
    _uid,
  } = blok;
  const { desktop } = useBreakpoints();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextAnimationStart, setNextAnimationStart] = useState(false);
  const [prevAnimationStart, setPrevAnimationStart] = useState(false);
  const [clickedRight, setClickedRight] = useState(true);
  const dispatch = useAppDispatch();

  const setRightIndex = (index: number) => {
    if (nextAnimationStart) {
      if (index === 0 && currentIndex === items.length - 1) {
        return 3;
      } else {
        return 1;
      }
    }
    if (prevAnimationStart) {
      if (currentIndex === 0 && index === items.length - 1) {
        return items.length + 2;
      }
      return items.length + 1 - index;
    }
  };

  const handleNextReview = () => {
    setClickedRight(true);
    if (nextAnimationStart || prevAnimationStart) {
      return null;
    }
    setTimeout(() => {
      setNextAnimationStart(true);
      window.setTimeout(() => {
        setNextAnimationStart(false);
        if (currentIndex === items.length - 1) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      }, 500);
    }, 50);
  };

  const handlePrevReview = () => {
    setClickedRight(false);
    if (nextAnimationStart || prevAnimationStart) {
      return null;
    }
    setTimeout(() => {
      setPrevAnimationStart(true);
      window.setTimeout(() => {
        setPrevAnimationStart(false);
        if (currentIndex === 0) {
          setCurrentIndex(items.length - 1);
        } else {
          setCurrentIndex(currentIndex - 1);
        }
      }, 600);
    }, 50);
  };

  const handleButtonClick = useCallback(() => {
    dispatch(EVENT_STORYBLOK({ action: 'reviews_click', label: header, method: document?.title || '' }));
  }, [header]);

  if (!desktop && items.length === 1) {
    return (
      <DtStack useImpression {...storyblokEditable(blok)} componentName="review-banner" uid={_uid} key={_uid}>
        <Stack
          sx={(theme) => ({
            width: '100%',
            padding: `${8 * 4}px ${6 * 4}px`,
            backgroundColor: background_color || theme.palette.brand.warmLinen[500],
            flexDirection: 'column',
          })}
        >
          <Typography
            level={header_level}
            sx={(theme) => ({
              color: header_color || theme.palette.brand.maroonVelvet[500],
              mb: `${6 * 4}px`,
              textAlign: 'center',
            })}
          >
            {header}
          </Typography>
          <ImageOrVideo
            image={items[0].image}
            video={items[0].video}
            loader={{
              ratio: 0.8,
            }}
            sizes={['1-xs', '1-sm']}
          />
          <Stack
            sx={(theme) => ({
              mt: `${6 * 4}px`,
              mb: `${6 * 4}px`,
            })}
          >
            <Quote
              sx={(theme) => ({
                fill: theme.palette.brand.terracotta[500],
                width: `${5 * 4}px`,
                height: `${5 * 4}px`,
                mb: `${4 * 4}px`,
              })}
            />
            <RichTextTypography
              description={items[0].description}
              sx={(theme) => ({
                color: theme.palette.brand.maroonVelvet[500],
                mb: `${4 * 4}px`,
              })}
            />
            <Typography
              sx={(theme) => ({
                fontSize: '18px',
                lineHeight: '120%',
                fontStyle: 'italic',
                color: items[0]?.author_color || theme.palette.brand.maroonVelvet[500],
                mb: `${1 * 4}px`,
              })}
            >
              {items[0].author}
            </Typography>
            <Stack
              sx={{
                width: '100%',
                div: {
                  width: 'fit-content',
                },
              }}
            >
              <Rating
                rating={Number(items[currentIndex].rating)}
                size={20}
                innerColor={'#844025'}
                outerColor={'#CCCCCC'}
              />
            </Stack>
          </Stack>
          <Button
            variant="secondary"
            sx={(theme) => ({
              backgroundColor: button_background_color || theme.palette.brand.warmLinen[500],
              color: button_text_color || theme.palette.brand.maroonVelvet[500],
              border: `1px solid ${button_text_color || theme.palette.brand.maroonVelvet[500]}`,
              borderRadius: `${2 * 4}px`,
              padding: `${3 * 4}px ${6 * 4}px`,
              width: 'fit-content',
            })}
            onClick={() => {
              // window.location.href = '/reviews';
            }}
          >
            view all reviews
          </Button>
        </Stack>
      </DtStack>
    );
  }

  if (!desktop) {
    return (
      <DtStack useImpression {...storyblokEditable(blok)} componentName="review-banner" uid={_uid} key={_uid}>
        <Stack
          sx={(theme) => ({
            width: '100%',
            padding: `${8 * 4}px ${6 * 4}px`,
            backgroundColor: background_color || theme.palette.brand.warmLinen[500],
            flexDirection: 'column',
          })}
        >
          <Typography
            level={header_level}
            sx={(theme) => ({
              color: header_color || theme.palette.brand.maroonVelvet[500],
              mb: `${6 * 4}px`,
              textAlign: 'center',
            })}
          >
            {header}
          </Typography>
          <Stack
            sx={(theme) => ({
              position: 'relative',
              overflow: 'hidden',
            })}
          >
            {items.map((item, index) => {
              return (
                <Stack
                  key={index}
                  sx={[
                    {
                      position: 'absolute',
                      top: '15px',
                      left: 0,
                      right: 0,
                      zIndex: setRightIndex(index),
                    },
                    index !== currentIndex && {
                      transform: clickedRight ? 'translateX(100%)' : 'translateX(-100%)',
                      transformOrigin: nextAnimationStart ? 'right' : 'left',
                    },
                    nextAnimationStart &&
                      (currentIndex === items.length - 1 ? index === 0 : index === currentIndex + 1) && {
                        transform: 'translateX(0)',
                        transition: 'transform .5s ease-in-out',
                      },
                    prevAnimationStart &&
                      (currentIndex === 0 ? index === items.length - 1 : index === currentIndex - 1) && {
                        transform: 'translateX(0)',
                        transition: 'transform .5s ease-in-out',
                      },
                  ]}
                >
                  <ImageOrVideo
                    image={item.image}
                    video={item.video}
                    loader={{
                      ratio: 0.8,
                    }}
                    sizes={['1-xs', '1-sm']}
                  />
                </Stack>
              );
            })}
            <Stack
              sx={{
                opacity: 0,
              }}
            >
              <ImageOrVideo
                image={items[0].image}
                video={items[0].video}
                loader={{
                  ratio: 0.8,
                }}
                sizes={['1-xs', '1-sm']}
              />
            </Stack>
          </Stack>
          <Stack
            sx={(theme) => ({
              mt: `${6 * 4}px`,
              mb: `${4 * 4}px`,
            })}
          >
            <Quote
              sx={(theme) => ({
                fill: theme.palette.brand.terracotta[500],
                width: `${5 * 4}px`,
                height: `${5 * 4}px`,
                mb: `${4 * 4}px`,
              })}
            />
            <RichTextTypography
              description={items[currentIndex].description}
              sx={(theme) => ({
                color: theme.palette.brand.maroonVelvet[500],
                mb: `${4 * 4}px`,
              })}
            />
            <Typography
              sx={(theme) => ({
                fontSize: '18px',
                lineHeight: '120%',
                fontStyle: 'italic',
                color: items[currentIndex]?.author_color || theme.palette.brand.maroonVelvet[500],
                mb: `${1 * 4}px`,
              })}
            >
              {items[currentIndex].author}
            </Typography>
            <Stack
              sx={{
                width: '100%',
                div: {
                  width: 'fit-content',
                },
              }}
            >
              <Rating
                rating={Number(items[currentIndex].rating)}
                size={20}
                innerColor={'#844025'}
                outerColor={'#CCCCCC'}
              />
            </Stack>
          </Stack>
          <Stack
            sx={(theme) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              mb: `${6 * 4}px`,
            })}
          >
            <Button
              sx={(theme) => ({
                maxWidth: `${10 * 4}px !important`,
                maxHeight: `${10 * 4}px !important`,
                minWidth: `${10 * 4}px !important`,
                minHeight: `${10 * 4}px !important`,
                backgroundColor: 'transparent',
                border: 'none !important',
                ':hover': {
                  backgroundColor: 'transparent',
                },
              })}
              onClick={handlePrevReview}
            >
              <ArrowLeft
                sx={(theme) => ({
                  width: `${6 * 4}px`,
                  height: `${6 * 4}px`,
                  color: theme.palette.brand.terracotta[500],
                })}
              />
            </Button>

            <Typography
              sx={(theme) => ({
                ml: `${2 * 4}px`,
                mr: `${2 * 4}px`,
                color: theme.palette.brand.maroonVelvet[500],
              })}
            >
              {currentIndex + 1} / {items.length}
            </Typography>
            <Button
              sx={(theme) => ({
                maxWidth: `${10 * 4}px`,
                maxHeight: `${10 * 4}px`,
                minWidth: `${10 * 4}px`,
                minHeight: `${10 * 4}px`,
                backgroundColor: 'transparent',
                border: 'none !important',
                ':hover': {
                  backgroundColor: 'transparent',
                },
              })}
              onClick={handleNextReview}
            >
              <ArrowRight
                sx={(theme) => ({
                  width: `${6 * 4}px`,
                  height: `${6 * 4}px`,
                  color: theme.palette.brand.terracotta[500],
                })}
              />
            </Button>
          </Stack>
          <Link
            onClick={handleButtonClick}
            href="reviews"
            sx={(theme) => ({
              textDecoration: 'none',
              '&: hover': {
                textDecoration: 'none',
              },
            })}
          >
            <Button
              variant="secondary"
              sx={(theme) => ({
                backgroundColor: button_background_color || theme.palette.brand.warmLinen[500],
                color: button_text_color || theme.palette.brand.maroonVelvet[500],
                border: `1px solid ${button_text_color || theme.palette.brand.maroonVelvet[500]}`,
                borderRadius: `${2 * 4}px`,
                padding: `${3 * 4}px ${6 * 4}px`,
                width: 'fit-content',
              })}
              onClick={() => {
                // window.location.href = '/reviews';
              }}
            >
              view all reviews
            </Button>
          </Link>
        </Stack>
      </DtStack>
    );
  }

  if (items.length === 1 && desktop) {
    return (
      <DtStack useImpression {...storyblokEditable(blok)} componentName="review-banner" uid={_uid} key={_uid}>
        <Stack
          sx={(theme) => ({
            width: '100%',
            padding: `${10 * 4}px 0 ${10 * 4}px ${15 * 4}px`,
            backgroundColor: background_color || theme.palette.brand.warmLinen[500],
            flexDirection: 'row',
          })}
        >
          <Stack
            sx={(theme) => ({
              maxWidth: '33%',
              flex: 1,
              mr: `${15 * 4}px`,
              position: 'relative',
            })}
          >
            <Typography
              level={header_level}
              sx={(theme) => ({
                color: header_color || theme.palette.brand.maroonVelvet[500],
              })}
            >
              {header}
            </Typography>
            <Quote
              sx={(theme) => ({
                fill: theme.palette.brand.terracotta[500],
                width: `${6 * 4}px`,
                height: `${6 * 4}px`,
                mb: `${6 * 4}px`,
              })}
            />
            <Stack
              sx={{
                position: 'relative',
                width: '100%',
              }}
            >
              <Stack
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              >
                <RichTextTypography
                  description={items[0].description}
                  sx={(theme) => ({
                    color: theme.palette.brand.maroonVelvet[500],
                    mb: `${6 * 4}px`,
                  })}
                />
                <Typography
                  sx={(theme) => ({
                    fontSize: '20px',
                    lineHeight: '120%',
                    fontStyle: 'italic',
                    color: items[0]?.author_color || theme.palette.brand.maroonVelvet[500],
                    mb: `${1 * 4}px`,
                  })}
                >
                  {items[0].author}
                </Typography>
                <Stack
                  sx={{
                    width: '100%',
                    div: {
                      width: 'fit-content',
                    },
                  }}
                >
                  <Rating
                    rating={Number(items[currentIndex].rating)}
                    size={20}
                    innerColor={'#844025'}
                    outerColor={'#CCCCCC'}
                  />
                </Stack>
              </Stack>
            </Stack>
            <Button
              variant="secondary"
              sx={(theme) => ({
                position: 'absolute',
                bottom: 0,
                left: 0,
                backgroundColor: button_background_color || theme.palette.brand.warmLinen[500],
                color: button_text_color || theme.palette.brand.maroonVelvet[500],
                border: `1px solid ${button_text_color || theme.palette.brand.maroonVelvet[500]}`,
                borderRadius: `${2 * 4}px`,
                padding: `${3.75 * 4}px ${6 * 4}px`,
              })}
            >
              view all reviews
            </Button>
          </Stack>
          <Stack
            sx={{
              flex: 1,
            }}
          >
            <ImageOrVideo
              image={items[0].image}
              video={items[0].video}
              loader={{
                ratio: 0.52,
              }}
              sizes={['1-xs', '0.6-md', '0.6-lg', '0.4-xl']}
            />
          </Stack>
        </Stack>
      </DtStack>
    );
  }
  return (
    <DtStack useImpression {...storyblokEditable(blok)} componentName="review-banner" uid={_uid} key={_uid}>
      <Stack
        sx={(theme) => ({
          width: '100%',
          padding: `${10 * 4}px 0 ${10 * 4}px ${15 * 4}px`,
          backgroundColor: background_color || theme.palette.brand.warmLinen[500],
          flexDirection: 'row',
        })}
      >
        <Stack
          sx={(theme) => ({
            position: 'relative',
            maxWidth: '33%',
            flex: 1,
            mr: `${15 * 4}px`,
            flexDirection: 'column',
            justifyContent: 'space-between',
          })}
        >
          <Typography
            level={header_level}
            sx={(theme) => ({
              color: header_color || theme.palette.brand.maroonVelvet[500],
              mb: `${6 * 4}px`,
            })}
          >
            {header}
          </Typography>

          <Stack
            sx={(theme) => ({
              width: '100%',
              mb: `${6 * 4}px`,
            })}
          >
            <Quote
              sx={(theme) => ({
                fill: theme.palette.brand.terracotta[500],
                width: `${6 * 4}px`,
                height: `${6 * 4}px`,
                mb: `${6 * 4}px`,
              })}
            />
            <RichTextTypography
              description={items[currentIndex].description}
              sx={(theme) => ({
                color: theme.palette.brand.maroonVelvet[500],
                mb: `${6 * 4}px`,
              })}
            />
            <Typography
              sx={(theme) => ({
                fontSize: '20px',
                lineHeight: '120%',
                fontStyle: 'italic',
                color: items[currentIndex]?.author_color || theme.palette.brand.maroonVelvet[500],
                mb: `${1 * 4}px`,
              })}
            >
              {items[currentIndex].author}
            </Typography>
            <Stack
              sx={{
                width: '100%',
                div: {
                  width: 'fit-content',
                },
              }}
            >
              <Rating
                rating={Number(items[currentIndex].rating)}
                size={20}
                innerColor={'#844025'}
                outerColor={'#CCCCCC'}
              />
            </Stack>
          </Stack>
          <Link
            onClick={handleButtonClick}
            href="reviews"
            sx={(theme) => ({
              textDecoration: 'none',
              '&: hover': {
                textDecoration: 'none',
              },
            })}
          >
            <Button
              variant="secondary"
              sx={(theme) => ({
                backgroundColor: button_background_color || theme.palette.brand.warmLinen[500],
                color: button_text_color || theme.palette.brand.maroonVelvet[500],
                border: `1px solid ${button_text_color || theme.palette.brand.maroonVelvet[500]}`,
                borderRadius: `${2 * 4}px`,
                padding: `${3.75 * 4}px ${6 * 4}px`,
                // '&: hover': {
                //   backgroundColor: button_background_color || theme.palette.brand.warmLinen[500],
                // },
              })}
            >
              View all reviews
            </Button>
          </Link>
        </Stack>
        <Stack
          sx={(theme) => ({
            position: 'relative',
            flex: 1,
            pt: `${3.75 * 4}px`,
            overflow: 'hidden',
          })}
        >
          {items.map((item, index) => {
            return (
              <Stack
                key={index}
                sx={[
                  {
                    position: 'absolute',
                    top: '15px',
                    left: 0,
                    right: 0,
                    zIndex: setRightIndex(index),
                  },
                  index !== currentIndex && {
                    transform: clickedRight ? 'translateX(100%)' : 'translateX(-100%)',
                    transformOrigin: nextAnimationStart ? 'right' : 'left',
                  },
                  nextAnimationStart &&
                    (currentIndex === items.length - 1 ? index === 0 : index === currentIndex + 1) && {
                      transform: 'translateX(0)',
                      transition: 'transform .5s ease-in-out',
                    },
                  prevAnimationStart &&
                    (currentIndex === 0 ? index === items.length - 1 : index === currentIndex - 1) && {
                      transform: 'translateX(0)',
                      transition: 'transform .5s ease-in-out',
                    },
                ]}
              >
                <ImageOrVideo
                  image={item.image}
                  video={item.video}
                  loader={{
                    ratio: 0.52,
                  }}
                  sizes={['1-xs', '0.6-md', '0.6-lg', '0.4-xl']}
                />
              </Stack>
            );
          })}
          <Stack
            sx={{
              opacity: 0,
            }}
          >
            <ImageOrVideo
              image={items[0].image}
              video={items[0].video}
              loader={{
                ratio: 0.52,
              }}
              sizes={['0.7-md', '1-xs']}
            />
          </Stack>
          <Stack
            sx={(theme) => ({
              flexDirection: 'row',
              alignItems: 'center',
            })}
          >
            <Button
              sx={(theme) => ({
                width: `${10 * 4}px`,
                height: `${10 * 4}px`,
                backgroundColor: 'transparent',
                border: 'none',
                ':hover': {
                  backgroundColor: 'transparent',
                },
              })}
              onClick={handlePrevReview}
            >
              <ArrowLeft
                sx={(theme) => ({
                  width: `${6 * 4}px`,
                  height: `${6 * 4}px`,
                  color: theme.palette.brand.terracotta[500],
                })}
              />
            </Button>
            <Typography
              sx={(theme) => ({
                ml: `${2 * 4}px`,
                mr: `${2 * 4}px`,
                color: theme.palette.brand.maroonVelvet[500],
              })}
            >
              {currentIndex + 1} / {items.length}
            </Typography>
            <Button
              sx={(theme) => ({
                width: `${10 * 4}px`,
                height: `${10 * 4}px`,
                backgroundColor: 'transparent',
                border: 'none',
                ':hover': {
                  backgroundColor: 'transparent',
                },
              })}
              onClick={handleNextReview}
            >
              <ArrowRight
                sx={(theme) => ({
                  width: `${6 * 4}px`,
                  height: `${6 * 4}px`,
                  color: theme.palette.brand.terracotta[500],
                })}
              />
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </DtStack>
  );
};

export { ReviewBanner };
