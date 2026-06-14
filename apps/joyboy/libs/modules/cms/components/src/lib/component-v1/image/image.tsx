'use client';

import { Stack, useBreakpoints } from '@castlery/fortress';
import { useTrackingTags } from '@castlery/modules-tracking-components';
import { FortressImage } from '@castlery/shared-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_STORYBLOK } from '@castlery/modules-tracking-services';

export type ImageProps = {
  blok: {
    _uid?: string;
    desktop_url?: string;
    tablet_url?: string;
    mobile_url?: string;
    desktopUrl?: string;
    tabletUrl?: string;
    mobileUrl?: string;
    alt?: string;
    isPreload?: boolean;
  };
  loader?: {
    [key: string]: any;
  };
  lazy?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  sizes?: Array<string | number> | string;
};

type ImageUrls = {
  [key: string]: string | undefined;
};

export const useDevice = () => {
  const { mobile, tablet, desktop } = useBreakpoints();
  const device = useMemo(() => {
    if (mobile) return 'mobile';
    if (tablet) return 'tablet';
    if (desktop) return 'desktop';
    return 'desktop';
  }, [mobile, tablet, desktop]);
  return device;
};

const Image = ({ blok, loader, lazy = true, imageWidth, imageHeight, sizes }: ImageProps) => {
  const device = useDevice();
  const hasTrackedRef = useRef(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();

  const { _uid, desktop_url, tablet_url, mobile_url, desktopUrl, mobileUrl, tabletUrl, alt } = blok || {};
  const imageUrl: ImageUrls = useMemo(
    () => ({
      mobile: mobile_url || mobileUrl,
      tablet: tablet_url || mobile_url || tabletUrl || mobileUrl,
      desktop: desktop_url || desktopUrl,
    }),
    [mobile_url, mobileUrl, tablet_url, tabletUrl, desktop_url, desktopUrl]
  );

  const trackingTags = useTrackingTags({
    moduleName: 'general-image',
    elementName: alt || '',
    content: {
      assetLink: imageUrl?.[device],
    },
  });

  const trackImageView = useCallback(() => {
    if (imageUrl?.[device] && !hasTrackedRef.current) {
      dispatch(EVENT_STORYBLOK({ action: 'image_video view', label: imageUrl?.[device], position: '100% Completion' }));
      hasTrackedRef.current = true;
    }
  }, [imageUrl, device]);

  useEffect(() => {
    const element = imageRef.current;
    if (!element || !imageUrl?.[device]) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedRef.current) {
            trackImageView();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // 当10%的图片进入视窗时触发
        rootMargin: '50px', // 提前50px开始检测
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [imageUrl, device, trackImageView]);

  if (blok?.isPreload) {
    lazy = false;
  }

  return (
    <Stack
      ref={imageRef}
      {...storyblokEditable(blok)}
      key={_uid}
      sx={() => ({
        width: '100%',
        div: {
          overflow: 'hidden',
        },
      })}
    >
      <FortressImage
        {...trackingTags}
        src={imageUrl?.[device] || ''}
        alt={alt || ''}
        objectFit={loader?.objectFit || 'cover'}
        ratio={1 / (loader?.ratio || 1)}
        lazy={lazy}
        needPreload={blok?.isPreload}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        sizes={sizes}
        sx={{
          ...(imageHeight
            ? {
                '--AspectRatio-paddingBottom': 0,
              }
            : {}),
        }}
      />
    </Stack>
  );
};

export { Image };
