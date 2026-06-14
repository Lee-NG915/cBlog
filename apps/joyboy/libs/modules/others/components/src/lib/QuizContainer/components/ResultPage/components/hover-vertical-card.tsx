'use client';

import { Button, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';
import { useEffect, useState } from 'react';

interface HoverVerticalCardProps {
  header: string;
  image: {
    desktop: {
      src: string;
      ratio: number;
    };
    mobile: {
      src: string;
      ratio: number;
    };
  };
  button: {
    text: string;
    to: string;
  };
  onClickChange: () => void;
}
const HoverVerticalCard = ({ header, image, button, onClickChange }: HoverVerticalCardProps) => {
  const { desktop } = useBreakpoints();

  return (
    <Stack
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 520,
      }}
    >
      <FortressImage
        src={desktop ? image.desktop.src : image.mobile.src}
        alt={header}
        ratio={desktop ? image.desktop.ratio : image.mobile.ratio}
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
          opacity: 1,
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
            level="h3"
            sx={(theme) => ({
              opacity: 1,
              transition: 'opacity 0.3s ease-in-out',
              marginBottom: '24px',
              color: theme.palette.brand.warmLinen[500],
            })}
          >
            {header}
          </Typography>
        )}
        <Button
          size="sm"
          variant="solid"
          sx={(theme) => ({
            width: 'fit-content',
            color: theme.palette.brand.maroonVelvet[500],
            backgroundColor: theme.palette.brand.warmLinen[500],
            border: 'none',
            '&:hover': {
              backgroundColor: theme.palette.brand.burntOrange[500],
              color: theme.palette.brand.warmLinen[500],
              border: 'none',
            },
          })}
          onClick={() => {
            onClickChange?.();
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }}
        >
          {button.text}
        </Button>
      </Stack>
    </Stack>
  );
};

export { HoverVerticalCard, HoverVerticalCardProps };
