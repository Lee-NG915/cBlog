'use client';

import React, { useCallback, useMemo } from 'react';
import { DtStack } from '@castlery/modules-tracking-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ProductListingBannerStoryblok } from '@castlery/types';
import { hasRichText } from '../../utils/rich-text-utils';
import { ImageOrVideo, RichTextTypography } from '../component-v1/components';
import { ProductCard } from '../product-card';
import { RightArrow } from '@castlery/fortress/Icons';

interface ProductListingBannerProps {
  blok: ProductListingBannerStoryblok;
}

const ProductListingBanner = ({ blok }: ProductListingBannerProps) => {
  const { text_card, text_position, product_card } = blok;
  const productCardLength = product_card.length;
  const textCardWidth = productCardLength === 2 ? '60%' : productCardLength === 3 ? '40%' : '0%';
  const productCardWidth = productCardLength === 2 ? '40%' : productCardLength === 3 ? '60%' : '100%';
  const { desktop } = useBreakpoints();

  const calcRatio = useMemo(() => {
    if (desktop) {
      if (textCardWidth === '60%') {
        return 0.53;
      }
      if (textCardWidth === '40%') {
        return 0.79;
      }
    }
    return 0.7;
  }, [desktop, textCardWidth]);

  const renderTextCard = useCallback(() => {
    if (productCardLength >= 5) {
      return null;
    }
    if (text_card.length > 0) {
      const { bg_color, header, header_color, description, image, video, link } = text_card[0];
      if (desktop) {
        return (
          <Stack
            sx={(theme) => ({
              position: 'relative',
              width: textCardWidth,
              px: '32px',
              backgroundColor: bg_color || theme.palette.brand.leafGreen[500],
              justifyContent: 'center',
              ...(desktop && {
                minHeight: '550px',
                maxHeight: '550px',
              }),
            })}
          >
            <Stack
              sx={{
                position: 'absolute',
                zIndex: 10,
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                px: '32px',
                justifyContent: 'center',
              }}
            >
              <Typography
                level="h2"
                sx={(theme) => ({
                  color: header_color || theme.palette.brand.warmLinen[500],
                  mb: '16px',
                })}
              >
                {header}
              </Typography>
              {hasRichText(description) && (
                <RichTextTypography
                  description={description}
                  sx={(theme) => ({
                    color: theme.palette.brand.warmLinen[500],
                    mb: '24px',
                  })}
                />
              )}
              {link.length > 0 && (
                <Stack>
                  {link.map((link) => (
                    <Link
                      key={link._uid}
                      href={link.url}
                      target={link.open_in_new_tab ? '_blank' : '_self'}
                      sx={(theme) => ({
                        textDecorationLine: 'underline',
                        textDecorationColor: link.text_color || theme.palette.brand.warmLinen[500],
                      })}
                      endDecorator={<RightArrow fill={link.text_color || '#F6F3E7'} />}
                    >
                      <Typography
                        sx={(theme) => ({
                          color: link.text_color || theme.palette.brand.warmLinen[500],
                        })}
                      >
                        {link.text}
                      </Typography>
                    </Link>
                  ))}
                </Stack>
              )}
            </Stack>
            {(video.length > 0 || image.length > 0) && (
              <Stack
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  div: {
                    height: '100%',
                    paddingTop: '0 !important',
                  },
                }}
              >
                <ImageOrVideo
                  video={video}
                  image={image}
                  loader={{
                    ratio: calcRatio,
                  }}
                />
              </Stack>
            )}
          </Stack>
        );
      }
      return (
        <Stack
          sx={(theme) => ({
            height: '279px',
            width: '100%',
            backgroundColor: bg_color || theme.palette.brand.leafGreen[500],
            position: 'relative',
          })}
        >
          {(video.length > 0 || image.length > 0) && (
            <Stack
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                div: {
                  height: '100%',
                  paddingTop: '0 !important',
                },
              }}
            >
              <ImageOrVideo
                video={video}
                image={image}
                loader={{
                  ratio: calcRatio,
                }}
                sizes={['1-xs', '0.6-md', '0.6-lg', '0.4-xl']}
              />
            </Stack>
          )}
          <Stack
            sx={{
              position: 'absolute',
              zIndex: 10,
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              padding: '24px',
              justifyContent: 'center',
            }}
          >
            <Typography
              level="h2"
              sx={(theme) => ({
                color: header_color || theme.palette.brand.warmLinen[500],
                mb: '16px',
              })}
            >
              {header}
            </Typography>
            {hasRichText(description) && (
              <RichTextTypography
                description={description}
                sx={(theme) => ({
                  color: theme.palette.brand.warmLinen[500],
                  mb: '24px',
                })}
              />
            )}
            {link.length > 0 && (
              <Stack>
                {link.map((link) => (
                  <Link
                    key={link._uid}
                    target={link.open_in_new_tab ? '_blank' : '_self'}
                    href={link.url}
                    sx={(theme) => ({
                      textDecorationLine: 'underline',
                      textDecorationColor: link.text_color || theme.palette.brand.warmLinen[500],
                    })}
                    endDecorator={<RightArrow fill={link.text_color || '#F6F3E7'} />}
                  >
                    <Typography
                      sx={(theme) => ({
                        color: link.text_color || theme.palette.brand.warmLinen[500],
                      })}
                    >
                      {link.text}
                    </Typography>
                  </Link>
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      );
    }
    return null;
  }, [text_card, textCardWidth, desktop]);

  const renderProductCard = useCallback(() => {
    if (product_card.length > 0) {
      return (
        <Stack
          direction="row"
          gap={desktop ? '24px' : '0'}
          sx={(theme) => ({
            px: '16px',
            width: desktop ? productCardWidth : '100%',
            overflowX: 'auto',
            flexWrap: desktop ? 'nowrap' : 'wrap',
            ...(!desktop && {
              padding: '24px 16px',
            }),
          })}
        >
          {desktop && product_card.map((product) => <ProductCard blok={product} />)}
          {!desktop &&
            product_card.map((product) => (
              <Stack
                key={product._uid}
                sx={{
                  width: '50%',
                  ...(!desktop && {
                    mb: '16px',
                  }),
                }}
              >
                <ProductCard blok={product} />
              </Stack>
            ))}
        </Stack>
      );
    }
    return null;
  }, [product_card, desktop]);

  return (
    <DtStack uid={blok._uid} componentName="product-listing-banner" {...storyblokEditable(blok)}>
      <Stack
        sx={{
          width: '100%',
          flexDirection: desktop ? (text_position === 'left' ? 'row' : 'row-reverse') : 'column',
          alignItems: 'center',
        }}
      >
        {renderTextCard()}
        {renderProductCard()}
      </Stack>
    </DtStack>
  );
};

export { ProductListingBanner };
