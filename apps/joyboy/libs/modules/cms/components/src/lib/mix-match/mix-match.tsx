'use client';

import React from 'react';
import { Stack, useBreakpoints } from '@castlery/fortress';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';

import { VideoProps } from '../component-v1/video/video';
import { ImageProps } from '../component-v1/image/image';
import { DtStack } from '@castlery/modules-tracking-components';
interface MixMatchCardInnerBlokProps {
  _uid: string;
  size: 'small' | 'medium' | 'large';
  background_color: string;
  header: string;
  image: ImageProps[];
  video: VideoProps[];
  text: string;
  link: {
    text: string;
    url: string;
  }[];
  direction: 'left' | 'right';
  text_color: string;
  stretchPos?: number;
}

interface MixMatchV2Props {
  blok: {
    left: MixMatchCardInnerBlokProps[];
    right: MixMatchCardInnerBlokProps[];
    _uid: string;
  };
}

const MixMatchV2 = ({ blok }: MixMatchV2Props) => {
  const { left, right, _uid } = blok;
  const { desktop } = useBreakpoints();
  const list = [...left, ...right];
  let leftSmallNum = 0;
  let leftMediumNum = 0;
  let rightSmallNum = 0;
  let rightMediumNum = 0;

  left.forEach((item) => {
    if (item.size === 'small') {
      leftSmallNum++;
    }
    if (item.size === 'medium') {
      leftMediumNum++;
    }
  });

  right.forEach((item) => {
    if (item.size === 'small') {
      rightSmallNum++;
    }
    if (item.size === 'medium') {
      rightMediumNum++;
    }
  });

  const applySameHeight = leftSmallNum + rightMediumNum === 3 || rightSmallNum + leftMediumNum === 3;

  if (desktop) {
    if (left.length === 0) {
      return (
        <DtStack useImpression {...storyblokEditable(blok)} componentName="mix-match" uid={_uid} key={_uid}>
          <Stack direction="row">
            {right.map((nestedBlok, index) => {
              return <StoryblokServerComponent blok={nestedBlok} key={index} />;
            })}
          </Stack>
        </DtStack>
      );
    }

    if (right.length === 0) {
      return (
        <DtStack useImpression {...storyblokEditable(blok)} componentName="mix-match" uid={_uid} key={_uid}>
          <Stack direction="row">
            {left.map((nestedBlok, index) => {
              return <StoryblokServerComponent blok={nestedBlok} key={index} />;
            })}
          </Stack>
        </DtStack>
      );
    }

    return (
      <DtStack useImpression {...storyblokEditable(blok)} componentName="mix-match" uid={_uid} key={_uid}>
        <Stack direction="row" sx={{ alignItems: applySameHeight ? 'stretch' : 'flex-start' }}>
          <Stack
            direction="column"
            sx={[
              {
                flex: 1,
              },
              applySameHeight &&
                leftSmallNum === 2 && {
                  position: 'relative',
                },
            ]}
          >
            {left.map((nestedBlok, index) => {
              if (applySameHeight && leftSmallNum === 2 && index === 0) {
                nestedBlok.stretchPos = 0;
              }
              if (applySameHeight && leftSmallNum === 2 && index === 1) {
                nestedBlok.stretchPos = 1;
              }
              return <StoryblokServerComponent blok={nestedBlok} key={index} />;
            })}
          </Stack>
          <Stack
            direction="column"
            sx={[
              {
                flex: 1,
              },
              applySameHeight &&
                rightSmallNum === 2 && {
                  position: 'relative',
                },
            ]}
          >
            {right.map((nestedBlok, index) => {
              if (applySameHeight && rightSmallNum === 2 && index === 0) {
                nestedBlok.stretchPos = 0;
              }
              if (applySameHeight && rightSmallNum === 2 && index === 1) {
                nestedBlok.stretchPos = 1;
              }
              return <StoryblokServerComponent blok={nestedBlok} key={index} />;
            })}
          </Stack>
        </Stack>
      </DtStack>
    );
  }

  return (
    <DtStack useImpression {...storyblokEditable(blok)} componentName="mix-match" uid={_uid} key={_uid}>
      <Stack direction="column">
        {list.map((nestedBlok, index) => {
          return <StoryblokServerComponent blok={nestedBlok} key={index} />;
        })}
      </Stack>
    </DtStack>
  );
};

export { MixMatchV2 };
