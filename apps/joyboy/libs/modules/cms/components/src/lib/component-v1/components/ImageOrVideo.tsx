import React from 'react';
import { Stack } from '@castlery/fortress';
import { StoryblokServerComponent } from '@storyblok/react/rsc';
import { ImageProps } from './../image';
import { VideoProps } from './..//video';
import { ControlledVideo } from '@castlery/shared-components';

type ImageOrVideoProps = {
  image?: ImageProps[];
  video?: VideoProps[];
  loader?: object;
  lazy?: boolean;
  className?: string;
  imageWidth?: number;
  imageHeight?: number;
  sizes?: Array<string | number> | string;
  useControlledVideo?: boolean;
  isPlaying?: boolean;
  onPlaybackStateChange?: (state: 'playing' | 'paused' | 'ended') => void;
  onShouldSwitch?: () => void;
};

const ImageOrVideo = ({
  video = [],
  image = [],
  loader,
  lazy,
  className,
  imageWidth,
  imageHeight,
  sizes,
  useControlledVideo = false,
  isPlaying,
  onPlaybackStateChange,
  onShouldSwitch,
}: ImageOrVideoProps) => {
  const hasVideo = video.length > 0;
  const hasImage = image.length > 0;

  if (useControlledVideo && hasVideo) {
    return (
      <Stack className={className}>
        <ControlledVideo
          blok={video[0]}
          loader={loader}
          isPlaying={isPlaying}
          isPreload={true}
          onPlaybackStateChange={onPlaybackStateChange}
          onShouldSwitch={onShouldSwitch}
        />
      </Stack>
    );
  }

  if (hasVideo) {
    return (
      <Stack className={className}>
        {video.map((nestedBlok) => (
          <StoryblokServerComponent
            blok={nestedBlok}
            key={nestedBlok._uid}
            loader={loader}
            lazy={lazy}
            videoWidth={imageWidth}
            videoHeight={imageHeight}
          />
        ))}
      </Stack>
    );
  }
  if (hasImage) {
    return (
      <Stack className={className}>
        {image.map((nestedBlok) => (
          <StoryblokServerComponent
            blok={nestedBlok}
            key={nestedBlok._uid}
            loader={loader}
            lazy={lazy}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            sizes={sizes}
          />
        ))}
      </Stack>
    );
  }
  return null;
};

export { ImageOrVideo };
