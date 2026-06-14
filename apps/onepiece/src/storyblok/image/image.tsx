import React, { useEffect } from 'react';
import { storyblokEditable } from '@storyblok/react';
import { useDevice } from 'utils/hooks';
import { Stack } from '@castlery/fortress';
import { EVENT_VIEW_IMAGE_VIDEO } from 'utils/track/constants';
import { useInView } from 'react-intersection-observer';
import { useDispatch } from 'react-redux';
import ReactPicture from 'components/ReactPicture';

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
  };
  loader?: {
    [key: string]: any;
  };
  lazy?: boolean;
};

type ImageUrls = {
  [key: string]: string | undefined;
};

const Image = ({ blok, loader, lazy = true }: ImageProps) => {
  const device = useDevice();
  const [imgRef, imgInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const dispatch = useDispatch();

  const { _uid, desktop_url, tablet_url, mobile_url, desktopUrl, mobileUrl, tabletUrl, alt } = blok || {};
  const imageUrl: ImageUrls = {
    mobile: mobile_url || mobileUrl,
    tablet: tablet_url || mobile_url || tabletUrl || mobileUrl,
    desktop: desktop_url || desktopUrl,
  };

  useEffect(() => {
    if (imgInView) {
      dispatch({
        type: EVENT_VIEW_IMAGE_VIDEO,
        result: {
          percentage: 100,
          assetLink: imageUrl[device],
        },
      });
    }
  }, [imgInView, dispatch]);

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      ref={imgRef}
      sx={() => ({
        width: '100%',
      })}
    >
      <ReactPicture
        srcset={imageUrl[device]}
        alt={alt}
        loader={{
          objectFit: 'cover',
          ...loader,
        }}
        lazy={lazy}
      />
    </Stack>
  );
};

export { Image };
