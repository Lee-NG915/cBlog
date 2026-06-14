import React, { useEffect } from 'react';
import { storyblokEditable } from '@storyblok/react';
import { useDevice } from 'utils/hooks';
import { AdvancedImage, lazyload, responsive } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { Stack } from '@castlery/fortress';
import { EVENT_VIEW_IMAGE_VIDEO } from 'utils/track/constants';
import { useInView } from 'react-intersection-observer';
import { useDispatch } from 'react-redux';
import { extractPublicIdFromUrl } from '../tool';

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
  const [imgRef, imgInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const dispatch = useDispatch();
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

  console.log(extractPublicIdFromUrl(imageUrl[device]), '--ee');

  const myImage = cld.image(extractPublicIdFromUrl(imageUrl[device]));
  if (resize) {
    myImage.resize(resize[device]).format('auto').quality('auto');
  } else {
    myImage.format('auto').quality('auto');
  }

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
