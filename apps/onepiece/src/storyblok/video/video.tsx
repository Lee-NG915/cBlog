import React, { useState } from 'react';
import { storyblokEditable } from '@storyblok/react';
import { useDevice } from 'utils/hooks';
import { AdvancedVideo } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { Stack } from '@castlery/fortress';
import { EVENT_VIEW_IMAGE_VIDEO } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import debounce from 'lodash/debounce';
import { extractPublicIdFromUrl } from '../tool';

export type VideoProps = {
  blok: {
    _uid?: string;
    desktop_url?: string;
    tablet_url?: string;
    mobile_url?: string;
    desktopUrl?: string;
    tabletUrl?: string;
    mobileUrl?: string;
    autoplay?: boolean;
    controls?: boolean;
  };
  loader?: {
    [key: string]: any;
  };
  resize?: {
    [key: string]: any;
  };
};

type VideoUrls = {
  [key: string]: string | undefined;
};

const VideoWrapper = ({ blok, loader = {}, resize }: VideoProps) => {
  const device = useDevice();
  const desktop = device === 'desktop';
  const cld = new Cloudinary({
    cloud: {
      cloudName: 'castlery',
    },
  });
  const { _uid, desktop_url, tablet_url, mobile_url, autoplay, controls, desktopUrl, mobileUrl, tabletUrl } =
    blok || {};
  const { ratio } = loader;

  const videoUrl: VideoUrls = {
    mobile: mobile_url || mobileUrl,
    tablet: tablet_url || mobile_url || tabletUrl || mobileUrl,
    desktop: desktop_url || desktopUrl,
  };
  const width = !desktop ? 1280 : 1920;
  const [watchCompleted, setWatchCompleted] = useState(false);
  const dispatch = useDispatch();

  const myVideo = cld.video(extractPublicIdFromUrl(videoUrl[device]));
  if (ratio > 0) {
    myVideo.resize(`ar_${1 / ratio},c_fill`).format('auto');
  } else {
    myVideo.resize(fill().width(width)).format('auto');
  }

  const debouncedTrack = debounce((percentage) => {
    if (watchCompleted) return;
    if (percentage === 100) {
      setWatchCompleted(true);
    }

    dispatch({
      type: EVENT_VIEW_IMAGE_VIDEO,
      result: {
        percentage,
        assetLink: videoUrl[device],
      },
    });
  }, 1000);

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      sx={() => ({
        width: '100%',
        video: {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
      })}
    >
      <AdvancedVideo
        onTimeUpdate={(event) => {
          if (event.target instanceof HTMLVideoElement) {
            const percentage = Math.round((event.target.currentTime / event.target.duration) * 100);
            if ([25, 50, 75, 100].includes(percentage)) {
              debouncedTrack(percentage);
            }
          }
        }}
        cldVid={myVideo}
        controls={controls}
        muted
        loop
        autoPlay={autoplay}
        playsInline
      />
    </Stack>
  );
};

export { VideoWrapper };
