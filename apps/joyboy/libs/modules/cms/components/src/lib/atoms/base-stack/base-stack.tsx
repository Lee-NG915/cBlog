import { Stack } from '@castlery/fortress';
import { BaseStackStoryblok } from '@castlery/types';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import React from 'react';

interface BaseStackProps {
  blok: BaseStackStoryblok;
}

export function BaseStack({ blok }: BaseStackProps) {
  const { direction, spacing, content } = blok;
  const validDirection = direction as 'row' | 'column' | 'row-reverse' | 'column-reverse' | undefined;
  return (
    <Stack
      sx={{
        width: '100%',
        px: 2,
        py: 1,
      }}
      direction={validDirection}
      spacing={Number(spacing)}
      alignItems={'flex-start'}
      {...storyblokEditable(blok)}
    >
      {content?.map((item) => {
        return <StoryblokServerComponent blok={item} key={item._uid} />;
      })}
    </Stack>
  );
}

export default BaseStack;
