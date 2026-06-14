import React from 'react';
import { Stack } from '@castlery/fortress';
import { StoryblokComponent } from '@storyblok/react';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';

type ImageOrVideoProps = {
  image?: ImageProps[];
  video?: VideoProps[];
  loader?: object;
  lazy?: boolean;
  className?: string;
};

const ImageOrVideo = ({ video = [], image = [], loader, lazy, className }: ImageOrVideoProps) => {
  const hasVideo = video.length > 0;
  const hasImage = image.length > 0;

  if (hasVideo) {
    return (
      <Stack className={className}>
        {video.map((nestedBlok) => (
          <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} loader={loader} lazy={lazy} />
        ))}
      </Stack>
    );
  }
  if (hasImage) {
    return (
      <Stack className={className}>
        {image.map((nestedBlok) => (
          <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} loader={loader} lazy={lazy} />
        ))}
      </Stack>
    );
  }
  return null;
};

export { ImageOrVideo };
