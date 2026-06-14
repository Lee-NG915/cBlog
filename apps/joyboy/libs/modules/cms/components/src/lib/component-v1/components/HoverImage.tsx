'use client';

import React, { useState, useEffect } from 'react';
import { Stack } from '@castlery/fortress';
import { StoryblokServerComponent } from '@storyblok/react/rsc';
import { ImageProps } from './../image';

type HoverImageProps = {
  image?: ImageProps[];
  hoverImageUrl?: ImageProps[];
  hovered?: boolean;
  loader?: object;
  lazy?: boolean;
};

const HoverImage = ({ image = [], hoverImageUrl = [], hovered = false, loader, lazy }: HoverImageProps) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsHovered(hovered);
  }, [hovered]);

  return (
    <Stack
      className={`hover-image ${isHovered ? 'hovered' : ''}`}
      sx={() => ({
        position: 'relative',
        '> div': {
          width: '100%',
          height: '100%',
          transition: 'opacity 0.3s ease',
          ':nth-of-type(2)': {
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0,
          },
        },
        '&.hovered': {
          '> div': {
            ':nth-of-type(1)': {
              opacity: 0,
            },
            ':nth-of-type(2)': {
              opacity: 1,
            },
          },
        },
      })}
    >
      {image.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} loader={loader} lazy={lazy} />
      ))}

      {hoverImageUrl.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} loader={loader} lazy={lazy} />
      ))}
    </Stack>
  );
};

export { HoverImage };
