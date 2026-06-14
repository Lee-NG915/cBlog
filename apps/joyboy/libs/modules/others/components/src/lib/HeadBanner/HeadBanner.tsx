'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';

type HeadBannerProps = {
  header: string;
  description?: string;
  image: {
    desktop_url: string;
    mobile_url: string;
    tablet_url: string;
    alt: string;
  };
  hideMarginBottom?: boolean;
};

const HeadBanner = ({ header, description, image, hideMarginBottom = false }: HeadBannerProps) => {
  const { desktop, tablet } = useBreakpoints();
  const [stackWidth, setStackWidth] = useState<number>(1728);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (stackRef.current) {
        const width = stackRef.current.offsetWidth;
        setStackWidth(width);
      }
    };

    // 使用 requestAnimationFrame 确保在下一帧渲染后获取尺寸
    requestAnimationFrame(() => {
      updateWidth();

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setStackWidth(entry.contentRect.width);
        }
      });

      if (stackRef.current) {
        resizeObserver.observe(stackRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    });
  }, []);

  return (
    <Stack
      ref={stackRef}
      sx={(theme) => ({
        width: '100%',
        height: '450px',
        position: 'relative',
        mb: hideMarginBottom ? '0 !important' : theme.spacing(10),
        ...(!desktop && {
          height: '300px',
          mb: hideMarginBottom ? '0 !important' : theme.spacing(6),
        }),
      })}
    >
      <FortressImage
        src={desktop ? image.desktop_url : tablet ? image.tablet_url : image.mobile_url}
        alt={image.alt}
        objectFit="cover"
        // imageWidth={stackWidth}
        // imageHeight={desktop ? 450 : 300}
        ratio={stackWidth / (desktop ? 450 : 300)}
        sx={
          {
            // '--AspectRatio-paddingBottom': 0,
          }
        }
      />
      <Stack
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          ...(!desktop && {
            px: theme.spacing(6),
          }),
        })}
      >
        <Typography
          level="h1"
          sx={(theme) => ({
            color: theme.palette.brand.warmLinen[500],
            mb: theme.spacing(6),
          })}
        >
          {header}
        </Typography>
        {description && (
          <Typography
            level="body1"
            sx={(theme) => ({
              color: theme.palette.brand.warmLinen[500],
              textAlign: 'center',
            })}
          >
            {description}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export { HeadBanner };
