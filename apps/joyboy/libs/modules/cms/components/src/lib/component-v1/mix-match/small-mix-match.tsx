'use client';

import React, { useRef } from 'react';
import { Grid, Typography, Stack, useBreakpoints } from '@castlery/fortress';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';

import { ButtonProps } from './../button';
import { ImageProps } from './../image';
import { VideoProps } from './../video';
import { useAnchorScroll } from './../hook/anchor';
import { RichTextTypography, ImageOrVideo } from '../components';
import { hasRichText } from '../../../utils/rich-text-utils';
import { DtStack } from '@castlery/modules-tracking-components';

export type SmallMixMatchProps = {
  blok: {
    _uid?: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    video?: VideoProps[];
    header?: string;
    description?: string;
    text_direction?: 'left' | 'right';
    anchor_link?: string;
  };
};

function SmallMixMatch({ blok }: SmallMixMatchProps) {
  const { desktop } = useBreakpoints();
  const {
    _uid,
    header,
    description,
    text_direction = 'left',
    image = [],
    video = [],
    button = [],
    anchor_link,
  } = blok || {};

  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  const hasText = header || hasRichText(description) || button?.length > 0;

  return (
    <DtStack
      useImpression
      {...storyblokEditable(blok)}
      componentName="small-mix-match"
      key={_uid}
      uid={_uid}
      ref={blokRef}
      id={anchor_link?.slice(1)}
      sx={(theme) => ({
        position: 'relative',
        border: `1px solid ${theme.palette.brand.wheat[600]}`,
        flexDirection: text_direction === 'left' ? 'row-reverse' : 'row',
        [theme.breakpoints.down('sm')]: {
          flexDirection: 'column',
        },
      })}
    >
      <Stack
        sx={(theme) => ({
          position: 'relative',
          width: hasText ? '60%' : '100%',
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
            ratio: !desktop ? 0.8379 : hasText ? 0.93 : 0.5613,
          }}
        />
      </Stack>

      {hasText && (
        <Grid
          container
          direction="column"
          justifyContent="center"
          sx={(theme) => ({
            flexWrap: 'nowrap',
            px: theme.spacing(3),
            py: theme.spacing(6),
            width: '40%',
            [theme.breakpoints.down('sm')]: {
              px: theme.spacing(4),
              py: theme.spacing(2),
              width: '100%',
            },
          })}
        >
          {header && <Typography level="h2">{header}</Typography>}

          {hasRichText(description) && (
            <RichTextTypography
              level="body2"
              sx={(theme) => ({
                mt: theme.spacing(3),
                [theme.breakpoints.down('sm')]: {
                  mt: theme.spacing(2),
                },
              })}
              description={description}
            />
          )}

          {button?.length > 0 && (
            <Stack
              sx={(theme) => ({
                mt: theme.spacing(6),
                [theme.breakpoints.down('sm')]: {
                  mt: theme.spacing(3),
                },
              })}
            >
              {button.map((nestedBlok) => (
                <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
              ))}
            </Stack>
          )}
        </Grid>
      )}
    </DtStack>
  );
}

export { SmallMixMatch };
