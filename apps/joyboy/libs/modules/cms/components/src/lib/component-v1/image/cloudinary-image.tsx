'use client';

import React from 'react';
import { storyblokEditable } from '@storyblok/react/rsc';
import { AdvancedImage, lazyload, responsive } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { Stack } from '@castlery/fortress';
import { useDevice } from './image';

export const extractPublicIdFromUrl = (url = '') => {
  const formatUrl = decodeURIComponent(url);
  if (formatUrl?.startsWith('https://res.cloudinary.com/castlery')) {
    const regex = /^https:\/\/res\.cloudinary\.com\/castlery\/(?:image|video)\/upload\/(v\d+\/)?(.+)\.\w+$/;
    const match = formatUrl.match(regex);
    if (match && match.length >= 3) {
      return match[2];
    }
    return formatUrl;
  }
  return formatUrl;
};

export type ImageProps = {
  blok: {
    _uid?: string;
    desktop_url?: string;
    tablet_url?: string;
    mobile_url?: string;
    alt?: string;
  };
  resize?: {
    [key: string]: any;
  };
};

type ImageUrls = {
  [key: string]: string | undefined;
};

const Image = ({ blok, resize }: ImageProps) => {
  const device = useDevice();
  const desktop = device === 'desktop';
  const cld = new Cloudinary({
    cloud: {
      cloudName: 'castlery',
    },
  });
  const { _uid, desktop_url, tablet_url, mobile_url, alt } = blok || {};
  const imageUrl: ImageUrls = {
    mobile: mobile_url,
    tablet: tablet_url || mobile_url,
    desktop: desktop_url,
  };

  const myImage = cld.image(decodeURIComponent(extractPublicIdFromUrl(imageUrl[device])));
  if (resize) {
    myImage.resize(resize[device]).format('auto').quality('auto');
  } else {
    myImage.format('auto').quality('auto');
  }

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      sx={() => ({
        width: '100%',
      })}
    >
      {/* <AdvancedImage cldImg={myImage} alt={alt} plugins={[lazyload(), responsive(), accessibility(), placeholder()]} /> */}
      <AdvancedImage
        cldImg={myImage}
        style={{ maxWidth: '100%' }}
        alt={alt}
        plugins={[
          lazyload(),
          responsive({
            steps: desktop ? [1280, 1440, 1920, 2880] : [700, 900, 1000, 1200, 1400],
          }),
          // placeholder({ mode: 'predominant-color' }),
        ]}
      />
    </Stack>
  );
};

export { Image };
