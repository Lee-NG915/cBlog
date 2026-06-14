'use client';

import React from 'react';
import { Container, Stack } from '@castlery/fortress';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';

import { ButtonProps } from './../button';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';

export type PageAnchorProps = {
  blok: {
    _uid?: string;
    buttons?: ButtonProps[];
  };
};

const PageAnchor = ({ blok }: PageAnchorProps) => {
  const { desktop } = useBreakpoints();
  const { _uid, buttons = [] } = blok || {};

  return (
    <Container>
      {desktop ? (
        <Stack {...storyblokEditable(blok)} key={_uid} direction="row" justifyContent="center" spacing={3}>
          {buttons.map((nestedBlok) => (
            <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
          ))}
        </Stack>
      ) : (
        <Stack
          {...storyblokEditable(blok)}
          key={_uid}
          flexDirection="row"
          justifyContent={buttons.length > 2 ? 'flex-start' : 'center'}
          gap={3}
          sx={() => ({
            width: '100%',
            overflow: 'auto',
            'div:nth-child(n+2)': {
              ml: '-1px',
            },
            div: {
              flexShrink: 0,
            },
          })}
        >
          {buttons.map((nestedBlok) => (
            <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
          ))}
        </Stack>
      )}
    </Container>
  );
};

export { PageAnchor };
