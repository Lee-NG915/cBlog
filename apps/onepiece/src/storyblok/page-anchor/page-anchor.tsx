import React from 'react';
import { Container, Stack } from '@castlery/fortress';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import { ButtonProps } from 'storyblok/button';
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
            <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
          ))}
        </Stack>
      ) : (
        <Stack
          {...storyblokEditable(blok)}
          key={_uid}
          flexDirection="row"
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
            <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
          ))}
        </Stack>
      )}
    </Container>
  );
};

export { PageAnchor };
