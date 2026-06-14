'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Button, Stack, useBreakpoints, Theme } from '@castlery/fortress';
import { ImageProps } from '../component-v1/image';
import { CustomLink, FortressImage } from '@castlery/shared-components';
import { ArrowLeft, ArrowRight } from '@castlery/fortress/Icons';
import { DtStack } from '@castlery/modules-tracking-components';
import { storyblokEditable } from '@storyblok/react/rsc';

interface ImageCarouselProps {
  blok: {
    background_color: string;
    items: {
      image: ImageProps[];
      link_url: string;
    }[];
    navigation_display: boolean;
    nums_in_line: '4' | '6';
    _uid: string;
  };
}

const ImageCarousel = ({ blok }: ImageCarouselProps) => {
  const { background_color, items, navigation_display, nums_in_line, _uid } = blok;
  const containerRef = useRef<HTMLDivElement>(null);
  const itemCount = items.length;
  const { desktop } = useBreakpoints();

  const generalWidth = desktop ? (nums_in_line === '4' ? 420 : 290) : 256;
  const generalWidthWithoutMargin = desktop ? (nums_in_line === '4' ? 404 : 278) : 240;

  const loopedItems = [...items, ...items, ...items];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [firstEnter, setFirstEnter] = useState(false);

  const handlePrev = () => {
    setCurrentIndex((prev) => prev - 1);
    setFirstEnter(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setFirstEnter(true);
  };

  useEffect(() => {
    if (itemCount > 0 && containerRef.current) {
      setCurrentIndex(itemCount);
      const transformValue = `translateX(-${itemCount * generalWidth}px)`;
      containerRef.current.style.transition = 'none';
      containerRef.current.style.transform = transformValue;
      // 强制重绘
      const _ = containerRef.current.offsetHeight;
      containerRef.current.style.transition = 'transform 0.3s ease-in-out';
    }
  }, [itemCount, generalWidth]);

  useEffect(() => {
    if (containerRef.current) {
      if (currentIndex === itemCount * 2 || currentIndex === 0) {
        if (firstEnter) {
          setTimeout(() => {
            const transformValue = `translateX(-${itemCount * generalWidth}px)`;
            containerRef.current!.style.transition = 'none';
            containerRef.current!.style.transform = transformValue;
            // 强制重绘
            const __ = containerRef.current!.offsetHeight;
            window.setTimeout(() => {
              if (containerRef.current) {
                containerRef.current.style.transition = 'transform 0.3s ease-in-out';
              }
            }, 50);
            setCurrentIndex(itemCount);
          }, 500);
        } else {
          const transformValue = `translateX(-${itemCount * generalWidth}px)`;
          containerRef.current!.style.transition = 'none';
          containerRef.current!.style.transform = transformValue;
          // 强制重绘
          const __ = containerRef.current!.offsetHeight;
          window.setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.style.transition = 'transform 0.3s ease-in-out';
            }
          }, 50);
          setCurrentIndex(itemCount);
        }
      }
    }
  }, [currentIndex, itemCount, generalWidth]);

  useEffect(() => {
    if (containerRef.current) {
      const transformValue = `translateX(-${currentIndex * generalWidth}px)`;
      containerRef.current.style.transform = transformValue;
    }
  }, [currentIndex, generalWidth]);

  return (
    <DtStack useImpression {...storyblokEditable(blok)} componentName="image-carousel" uid={_uid} key={_uid}>
      <Stack
        sx={(theme) => ({
          width: '100%',
          backgroundColor: background_color || theme.palette.brand.warmLinen[500],
          px: desktop && nums_in_line === '4' ? '32px' : 0,
          py: desktop ? '60px' : '32px',
        })}
      >
        <Stack sx={{ overflow: 'hidden' }}>
          <Stack
            ref={containerRef}
            sx={(theme) => ({
              display: 'flex',
              flexDirection: 'row',
              width: 'auto',
              transition: 'transform 0.3s ease-in-out',
              gap: nums_in_line === '4' ? '16px' : '12px',
            })}
          >
            {loopedItems.map((item, index) => {
              const image = item.image[0];
              return (
                <Stack
                  key={`image-carousel-${index}`}
                  sx={{
                    width: generalWidthWithoutMargin,
                    height: generalWidthWithoutMargin,
                    flexShrink: 0,
                  }}
                >
                  <CustomLink href={item.link_url}>
                    <FortressImage
                      src={(desktop ? image.desktop_url : image.mobile_url) || ''}
                      alt={image.alt || ''}
                      imageWidth={generalWidthWithoutMargin}
                      imageHeight={generalWidthWithoutMargin}
                      objectFit="cover"
                      sizes={[
                        '0.8-xs',
                        `${nums_in_line === '4' ? 0.25 : 0.18}-md`,
                        `${nums_in_line === '4' ? 0.25 : 0.18}-lg`,
                        `${(nums_in_line === '4' ? 0.25 : 0.18) * 0.8}-xl`,
                      ]}
                    />
                  </CustomLink>
                </Stack>
              );
            })}
          </Stack>

          {navigation_display && (
            <Stack
              sx={(theme) => ({
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                mt: desktop ? '32px' : '16px',
                paddingRight: desktop ? '32px' : '24px',
              })}
            >
              <Button
                sx={(theme: Theme) => ({
                  width: desktop ? 64 : `${40}px !important`,
                  height: desktop ? 64 : `${40}px !important`,
                  padding: 0,
                  minHeight: desktop ? 64 : `${40}px !important`,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.brand.warmLinen[200],
                  boxShadow: 'none',
                  marginRight: desktop ? '24px' : '16px',
                  border: 'none !important',
                  '&:hover': {
                    backgroundColor: theme.palette.brand.warmLinen[200],
                  },
                })}
                onClick={handlePrev}
              >
                <ArrowLeft
                  sx={(theme: Theme) => ({
                    // color: theme.palette.brand.burntOrange[500]
                    color: theme.palette.brand.terracotta[500],
                  })}
                />
              </Button>
              <Button
                sx={(theme: Theme) => ({
                  width: desktop ? 64 : `${40}px !important`,
                  height: desktop ? 64 : `${40}px !important`,
                  padding: 0,
                  minHeight: desktop ? 64 : `${40}px !important`,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.brand.warmLinen[200],
                  boxShadow: 'none',
                  border: 'none !important',
                  '&:hover': {
                    backgroundColor: theme.palette.brand.warmLinen[200],
                  },
                })}
                onClick={handleNext}
              >
                <ArrowRight
                  sx={(theme: Theme) => ({
                    // color: theme.palette.brand.burntOrange[500]
                    color: theme.palette.brand.terracotta[500],
                  })}
                />
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>
    </DtStack>
  );
};

export { ImageCarousel };
