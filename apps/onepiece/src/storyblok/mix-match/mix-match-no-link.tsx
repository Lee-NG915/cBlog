import React, { useRef } from 'react';
import { Grid, Typography, Stack } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useAnchorScroll } from '../hooks/anchor';
import { RichTextTypography, ImageOrVideo } from '../components';
import { hasRichText } from '../tool';

export type MixMatchNoLinkProps = {
  blok: {
    _uid?: string;
    image?: ImageProps[];
    video?: VideoProps[];
    header?: string;
    description?: string;
    size?: 'large' | 'medium';
    anchor_link?: string;
  };
};

function MixMatchNoLink({ blok }: MixMatchNoLinkProps) {
  const { desktop } = useBreakpoints();
  const { _uid, size = 'large', header, description, image = [], video = [], anchor_link } = blok || {};

  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  const hasText = header || hasRichText(description);
  const aspectRatioConfig = hasText
    ? {
        large: 0.7907,
        medium: 1.1378,
      }
    : {
        large: 1.1267,
        medium: 1.6326,
      };

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      ref={blokRef}
      id={anchor_link?.slice(1)}
      direction="column"
      sx={(theme) => ({
        position: 'relative',
        height: '100%',
        width: size === 'large' ? '59%' : '41%',
        border: `1px solid ${theme.palette.brand.wheat[600]}`,
        [theme.breakpoints.down('sm')]: {
          width: '100%',
          flexDirection: 'column-reverse',
        },
        ...(hasText ? {} : { div: { height: '100%' } }),
      })}
    >
      {hasText && (
        <Grid
          container
          direction="column"
          justifyContent="center"
          sx={(theme) => ({
            flex: 1,
            justifyContent: 'flex-start',
            px: theme.spacing(4),
            py: theme.spacing(6),
            [theme.breakpoints.down('sm')]: {
              px: theme.spacing(4),
              py: theme.spacing(3),
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
        </Grid>
      )}

      <ImageOrVideo
        video={video}
        image={image}
        loader={{
          ratio: !desktop ? 1.5251 : aspectRatioConfig[size],
        }}
      />
    </Stack>
  );
}

export { MixMatchNoLink };
