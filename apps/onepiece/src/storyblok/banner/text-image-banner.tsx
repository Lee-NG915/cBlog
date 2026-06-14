import React, { useRef } from 'react';
import { Stack } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react';
import { ButtonProps } from 'storyblok/button';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { ImageOrVideo } from '../components';
import { useAnchorScroll } from '../hooks/anchor';
import { useImgRatio } from '../hooks/ratio';
import BannerText from './components/BannerText';

export type BannerProps = {
  blok: {
    _uid?: string;
    button?: ButtonProps[];
    header?: string;
    header_level?: 'h1' | 'h2';
    sub_header?: string;
    sub_header_level?: 'h2' | 'h3';
    description?: string;
    size?: 'large' | 'medium' | 'small';
    image_direction?: 'left' | 'right';
    image?: ImageProps[];
    video?: VideoProps[];
    anchor_link?: string;
    bg_color?: string;
  };
};

function TextImageBanner({ blok }: BannerProps) {
  const {
    _uid,
    size = 'large',
    image_direction,
    header,
    header_level,
    sub_header,
    sub_header_level,
    description,
    image = [],
    video = [],
    button = [],
    bg_color,
    anchor_link,
  } = blok;
  const pxConfig = {
    large: 26,
    medium: 15,
    small: 5,
  };
  const aspectRatioConfig = {
    large: 0.9203,
    medium: 0.502,
    small: 0.3346,
  };

  const blokRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imgRatio = useImgRatio(size, aspectRatioConfig, textRef, 0.57);
  const { desktop } = useBreakpoints();
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      ref={blokRef}
      id={anchor_link?.slice(1)}
      sx={(theme) => ({
        flexDirection: image_direction === 'left' ? 'row' : 'row-reverse',
        [theme.breakpoints.down('sm')]: {
          flexDirection: 'column',
        },
      })}
    >
      <Stack
        sx={(theme) => ({
          width: '57%',
          [theme.breakpoints.down('sm')]: { width: '100%' },
          div: {
            height: '100%',
          },
        })}
      >
        <ImageOrVideo
          video={video}
          image={image}
          loader={{
            ratio: !desktop ? 0.6153 : imgRatio,
          }}
        />
      </Stack>

      <BannerText
        forwardRef={textRef}
        header={header}
        header_level={header_level}
        sub_header={sub_header}
        sub_header_level={sub_header_level}
        description={description}
        button={button}
        size={size}
        pxConfig={pxConfig}
        bgColor={bg_color}
        sx={(theme) => ({
          width: '43%',
          [theme.breakpoints.down('sm')]: {
            width: '100%',
            py: theme.spacing(10),
          },
        })}
      />
    </Stack>
  );
}

export { TextImageBanner };
