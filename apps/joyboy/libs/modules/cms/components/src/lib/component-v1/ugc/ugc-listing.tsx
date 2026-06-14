'use client';

import React from 'react';
import { storyblokEditable } from '@storyblok/react/rsc';
import { Stack, useBreakpoints, Typography } from '@castlery/fortress';
import { ImageProps } from './../image';
import { VideoProps } from './../video';
import { ImageOrVideo } from '../components';
import { ControlledVideo, CustomLink } from '@castlery/shared-components';
import { DtStack } from '@castlery/modules-tracking-components';

export type UGCListingProps = {
  blok: {
    _uid?: string;
    image?: ImageProps[];
    video?: VideoProps[];
    link: {
      url?: string;
      target?: string;
    };
    creator: string;
  };
  enableLink?: boolean;
  sizes?: Array<string | number> | string;
  useControlledVideo?: boolean;
  isPlaying?: boolean;
  onPlaybackStateChange?: (state: 'playing' | 'paused' | 'ended') => void;
  onShouldSwitch?: () => void;
  outerWidth?: number;
  outerHeight?: number;
};

const UGCListing = ({
  blok,
  enableLink = true,
  sizes,
  useControlledVideo = false,
  isPlaying,
  onPlaybackStateChange,
  onShouldSwitch,
  outerHeight,
  outerWidth,
}: UGCListingProps) => {
  const { _uid, image = [], video = [], link, creator } = blok || {};
  const { url, target = '_self' } = link || {};
  const isExternalLink = url?.startsWith('https://') || url?.startsWith('http://');
  const { desktop } = useBreakpoints();

  const listElement = (
    <>
      <Stack
        sx={(theme) => ({
          position: 'relative',
          width: '100%',
          height: '100%',
          // maxWidth: desktop ? theme.spacing(69.5) : theme.spacing(60),
        })}
      >
        <ImageOrVideo
          video={video}
          image={image}
          useControlledVideo={useControlledVideo}
          loader={{
            ratio: outerWidth && outerHeight ? outerHeight / outerWidth : 1,
          }}
          sizes={sizes}
          isPlaying={isPlaying}
          onPlaybackStateChange={onPlaybackStateChange}
          onShouldSwitch={onShouldSwitch}
        />
      </Stack>

      {creator && (
        <Typography
          level="caption2"
          sx={(theme) => ({
            color: theme.palette.brand.maroonVelvet[500],
            background: theme.palette.brand.warmLinen[200],
            boxShadow: '0px 1px 3px rgba(50, 52, 51, 0.2)',
            position: 'absolute',
            left: '16px',
            bottom: '16px',
            zIndex: 1,
            px: '8px',
            py: '4px',
            whiteSpace: desktop ? 'pre-line' : 'nowrap',
            maxWidth: `calc(100% - ${theme.spacing(8)})`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            ...(desktop
              ? {}
              : {
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                }),
          })}
        >
          {creator}
        </Typography>
      )}
    </>
  );

  return (
    <DtStack
      useImpression
      {...storyblokEditable(blok)}
      key={_uid}
      uid={_uid}
      componentName="ugc-listing"
      sx={{
        position: 'relative',
        height: outerHeight,
      }}
    >
      {url && enableLink ? (
        isExternalLink ? (
          <a href={url} target={target}>
            {listElement}
          </a>
        ) : (
          <CustomLink href={url} target={target}>
            {listElement}
          </CustomLink>
        )
      ) : (
        listElement
      )}
    </DtStack>
  );
};

export { UGCListing };
