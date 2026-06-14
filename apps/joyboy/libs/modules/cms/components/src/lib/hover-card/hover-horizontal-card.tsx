'use client';

import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { DtStack } from '@castlery/modules-tracking-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useCallback, useEffect, useState } from 'react';
import { hasRichText } from '../../utils/rich-text-utils';
import { ImageOrVideo, RichTextTypography } from '../component-v1/components';
import { ImageProps } from '../component-v1/image';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';

interface HoverHorizontalCardProps {
  blok: {
    _uid: string;
    body_text: string;
    header: string;
    header_level: 'h2' | 'h3';
    image: ImageProps[];
    header_color: string;
  };
}

const HoverHorizontalCard = ({ blok }: HoverHorizontalCardProps) => {
  const { body_text, header, header_level, image, header_color, _uid } = blok;
  const { desktop } = useBreakpoints();
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!desktop) {
      setIsHovered(true);
    }
  }, [desktop]);

  const handleHover = useCallback(() => {
    dispatch(
      EVENT_STORYBLOK({
        action: 'horizontal_image_hover',
        label: image[0]?.desktop_url || '',
        method: document?.title || '',
      })
    );
  }, [image]);

  const handleClick = useCallback(() => {
    dispatch(
      EVENT_STORYBLOK({
        action: 'horizontal_hover_listing_click',
        label: desktop ? image[0]?.desktop_url || '' : image[0]?.mobile_url || '',
        method: document?.title || '',
      })
    );
  }, [image, desktop]);

  useEffect(() => {
    if (isHovered && desktop) {
      handleHover();
    }
  }, [isHovered, desktop, handleHover]);

  return (
    <DtStack useImpression {...storyblokEditable(blok)} componentName="hover-horizontal-card" uid={_uid} key={_uid}>
      <Stack
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 600,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <ImageOrVideo
          image={image}
          loader={{
            ratio: desktop ? 0.6 : 1.33,
          }}
          sizes={['1-xs', '0.4-md', '0.4-lg', '0.3-xl']}
        />
        <Stack
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1,
            opacity: isHovered && desktop ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
        <Stack
          sx={(theme) => ({
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'flex-end',
            zIndex: 2,
            padding: '24px',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          })}
        >
          {hasRichText(body_text) && (
            <RichTextTypography
              level="body2"
              sx={(theme) => ({
                color: `${theme.palette.brand.warmLinen[500]} !important`,
                marginBottom: desktop ? '60px' : '24px',
              })}
              description={body_text}
            />
          )}
          <Typography
            level={header_level}
            sx={(theme) => ({
              color: header_color || `${theme.palette.brand.warmLinen[500]} !important`,
            })}
          >
            {header}
          </Typography>
        </Stack>
      </Stack>
    </DtStack>
  );
};

export { HoverHorizontalCard, HoverHorizontalCardProps };
