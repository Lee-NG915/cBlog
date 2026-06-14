import React, { useRef } from 'react';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import { Container, Stack } from '@castlery/fortress';
import { useAnchorScroll } from '../hooks/anchor';

export type MixMatchProps = {
  blok: {
    _uid?: string;
    left?: Array<{
      _uid: string;
    }>;
    right?: Array<{
      _uid: string;
    }>;
    left_size?: 'large' | 'medium';
    right_size?: 'large' | 'medium';
    anchor_link?: string;
  };
};

const MixMatch = ({ blok }: MixMatchProps) => {
  const { _uid, left, right, left_size = 'large', right_size = 'medium', anchor_link } = blok || {};
  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  return (
    <Container>
      <Stack
        {...storyblokEditable(blok)}
        key={_uid}
        ref={blokRef}
        id={anchor_link?.slice(1)}
        sx={(theme) => ({
          flexDirection: 'row',
          [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            mb: theme.spacing(2),
          },
        })}
      >
        <Stack
          sx={(theme) => ({
            flexDirection: 'column',
            width: left_size === 'large' ? '59%' : '41%',
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
            '> div': {
              width: '100%',
              [theme.breakpoints.down('sm')]: {
                mt: theme.spacing(2),
              },
              ':nth-child(n+2)': {
                [theme.breakpoints.up('sm')]: {
                  borderTopWidth: 0,
                  flex: 1,
                },
              },
            },
          })}
        >
          {left ? left.map((nestedBlok) => <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />) : null}
        </Stack>

        <Stack
          sx={(theme) => ({
            flexDirection: 'column',
            width: right_size === 'large' ? '59%' : '41%',
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
            '> div': {
              width: '100%',
              [theme.breakpoints.up('sm')]: {
                borderLeft: 'none',
              },
              [theme.breakpoints.down('sm')]: {
                mt: theme.spacing(2),
              },
              ':nth-child(n+2)': {
                [theme.breakpoints.up('sm')]: {
                  borderTopWidth: 0,
                  flex: 1,
                },
              },
            },
          })}
        >
          {right ? right.map((nestedBlok) => <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />) : null}
        </Stack>
      </Stack>
    </Container>
  );
};

export { MixMatch };
