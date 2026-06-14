'use client';

import React from 'react';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ImageProps } from '../component-v1/image';
import { VideoProps } from '../component-v1/video';
import { ButtonProps } from '../component-v1/button';
import { hasRichText } from '../../utils/rich-text-utils';
import { ImageOrVideo, RichTextTypography } from '../component-v1/components';
import { StoryblokServerComponent } from '@storyblok/react/rsc';

interface StandaloneBannerProps {
  blok: {
    header: string;
    header_level: 'h1' | 'h2';
    header_color: string;
    description: string;
    caption: string;
    background_color: string;
    text_position: 'left' | 'right';
    image: ImageProps[];
    video: VideoProps[];
    button: ButtonProps[];
  };
}

const StandaloneBanner = ({ blok }: StandaloneBannerProps) => {
  const {
    header,
    header_level,
    header_color,
    description,
    caption,
    background_color,
    text_position,
    image,
    video,
    button,
  } = blok;
  const { desktop } = useBreakpoints();
  if (!desktop) {
    return (
      <Stack
        sx={(theme) => ({
          width: '100%',
          padding: `32px 24px`,
          backgroundColor: background_color || theme.palette.brand.warmLinen[500],
        })}
      >
        <Typography
          level={header_level}
          sx={(theme) => ({
            color: header_color || theme.palette.brand.maroonVelvet[500],
            marginBottom: '24px',
          })}
        >
          {header}
        </Typography>
        {(video.length > 0 || image.length > 0) && (
          <ImageOrVideo
            video={video}
            image={image}
            loader={{
              ratio: 0.8,
            }}
            sizes={['1-xs', '1-md']}
          />
        )}
        {hasRichText(caption) && (
          <RichTextTypography
            description={caption}
            sx={(theme) => ({
              marginTop: '8px',
              color: theme.palette.brand.maroonVelvet[500],
              textAlign: 'left',
              fontSize: '14px !important',
              marginBottom: '24px',
            })}
          />
        )}
        {hasRichText(description) && (
          <RichTextTypography
            description={description}
            sx={(theme) => ({
              color: theme.palette.brand.maroonVelvet[500],
              marginBottom: '32px',
            })}
          />
        )}
        {button?.length > 0 && (
          <Stack>
            {button.map((nestedBlok) => (
              <StoryblokServerComponent
                blok={nestedBlok}
                key={nestedBlok._uid}
                color={nestedBlok.color}
                textColor={nestedBlok.text_color}
              />
            ))}
          </Stack>
        )}
      </Stack>
    );
  }
  return (
    <Stack
      sx={(theme) => ({
        width: '100%',
        padding: `40px 60px`,
        backgroundColor: background_color || theme.palette.brand.warmLinen[500],
        flexDirection: text_position === 'left' ? 'row' : 'row-reverse',
        pl: text_position === 'left' ? '60px' : 0,
        pr: text_position === 'right' ? '60px' : 0,
        alignItems: 'stretch',
        minHeight: '100%',
      })}
    >
      <Stack
        sx={(theme) => ({
          position: 'relative',
          width: '33.3%',
          marginRight: text_position === 'left' ? '60px' : 0,
          marginLeft: text_position === 'right' ? '60px' : 0,
        })}
      >
        <Typography
          level={header_level}
          sx={(theme) => ({
            position: 'absolute',
            top: 0,
            left: 0,
            color: header_color || theme.palette.brand.maroonVelvet[500],
          })}
        >
          {header}
        </Typography>
        <Stack
          sx={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: 0,
          }}
        >
          {hasRichText(description) && (
            <RichTextTypography
              description={description}
              sx={(theme) => ({
                color: theme.palette.brand.maroonVelvet[500],
              })}
            />
          )}
          <Stack
            sx={(theme) => ({
              position: 'absolute',
              bottom: 0,
              transform: 'translateY(100%)',
              left: 0,
              paddingTop: '32px',
            })}
          >
            {button?.length > 0 && (
              <Stack>
                {button.map((nestedBlok) => (
                  <StoryblokServerComponent
                    blok={nestedBlok}
                    key={nestedBlok._uid}
                    color={nestedBlok.color}
                    textColor={nestedBlok.text_color}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
      <Stack
        sx={{
          flex: 1,
          width: '66.7%',
        }}
      >
        {(video.length > 0 || image.length > 0) && (
          <ImageOrVideo
            video={video}
            image={image}
            loader={{
              ratio: 0.52,
            }}
            sizes={['1-xs', '0.6-md', '0.6-lg', '0.4-xl']}
          />
        )}
        {hasRichText(caption) && (
          <RichTextTypography
            description={caption}
            sx={(theme) => ({
              marginTop: '12px',
              color: theme.palette.brand.maroonVelvet[500],
              textAlign: text_position === 'left' ? 'left' : 'right',
              fontSize: '16px !important',
            })}
          />
        )}
      </Stack>
    </Stack>
  );
};

export { StandaloneBanner };
