'use client';

import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { DtStack } from '@castlery/modules-tracking-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useCallback, useEffect, useState } from 'react';
import { Button, ButtonProps } from '../component-v1/button';
import { ImageOrVideo } from '../component-v1/components';
import { ImageProps } from '../component-v1/image';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';

interface HoverVerticalCardProps {
  blok: {
    _uid: string;
    header: string;
    header_level: 'h2' | 'h3';
    image: ImageProps[];
    button: ButtonProps[];
    header_color: string;
  };
  hover_status?: boolean;
}
const HoverVerticalCard = ({ blok, hover_status = true }: HoverVerticalCardProps & { hover_status?: boolean }) => {
  const { header, header_level, image, button, header_color, _uid } = blok;
  const { desktop } = useBreakpoints();
  const [isHovered, setIsHovered] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!desktop) {
      setIsHovered(true);
    }
  }, [desktop]);

  useEffect(() => {
    if (desktop) {
      setIsHovered(!hover_status);
    }
  }, [hover_status, desktop]);

  const handleHover = useCallback(() => {
    dispatch(
      EVENT_STORYBLOK({
        action: 'vertical_image_hover',
        label: image[0]?.desktop_url || '',
        method: document?.title || '',
      })
    );
  }, [image]);

  const handleClick = useCallback(() => {
    dispatch(
      EVENT_STORYBLOK({
        action: 'vertical_hover_listing_click',
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
    <DtStack useImpression {...storyblokEditable(blok)} componentName="hover-vertical-card" uid={_uid} key={_uid}>
      <Stack
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (desktop) {
            setIsHovered(!hover_status);
          } else {
            setIsHovered(false);
          }
        }}
        onClick={handleClick}
      >
        <ImageOrVideo
          image={image}
          loader={{
            ratio: desktop ? 1.33 : 1.54,
          }}
          sizes={['0.8-xs', '0.3-md', '0.3-lg', '0.2-xl']}
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
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px',
            zIndex: 2,
          }}
        >
          {header && (
            <Typography
              level={header_level}
              sx={(theme) => ({
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                marginBottom: '24px',
                color: header_color || theme.palette.brand.warmLinen[500],
              })}
            >
              {header}
            </Typography>
          )}
          {button.length > 0 && (
            <Stack>
              {button.map((button) => (
                <Button key={button?._uid} blok={button} color={button.color} textColor={button.text_color} />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </DtStack>
  );
};

export { HoverVerticalCard, HoverVerticalCardProps };
