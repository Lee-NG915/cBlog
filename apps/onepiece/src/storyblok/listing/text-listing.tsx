import React from 'react';
import { Grid, Typography, Stack } from '@castlery/fortress';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import { ButtonProps } from 'storyblok/button';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { RichTextTypography, ImageOrVideo } from '../components';
import { hasRichText } from '../tool';

export type TextListingProps = {
  blok: {
    _uid?: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    video?: VideoProps[];
    header?: string;
    sub_header?: string;
    description?: string;
    size?: 'large' | 'small';
    bg_color?: string;
  };
};

function TextListing({ blok }: TextListingProps) {
  const { desktop } = useBreakpoints();
  const {
    _uid,
    size = 'large',
    header,
    sub_header,
    description,
    bg_color,
    image = [],
    video = [],
    button = [],
  } = blok || {};
  const hasAssetBg = video.length > 0 || image.length > 0;

  const aspectRatioConfig = {
    large: 0.7,
    small: 1.4,
  };

  const noContent = !header && !hasRichText(sub_header) && !hasRichText(description) && button?.length <= 0;

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      sx={(theme) => ({
        position: 'relative',
        width: size === 'large' ? '50%' : '25%',
        [theme.breakpoints.only('xs')]: {
          width: '100%',
        },
      })}
    >
      {(hasAssetBg || bg_color) && (
        <Stack
          sx={(theme) => ({
            position: noContent ? 'relative' : 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            ...(noContent && {
              minHeight: '180px',
            }),
            div: {
              height: '100%',
              [theme.breakpoints.not('xs')]: {
                paddingTop: '0 !important',
              },
              [theme.breakpoints.only('xs')]: {
                ...(!noContent && {
                  paddingTop: '0 !important',
                }),
              },
            },
            ...(hasAssetBg
              ? {
                  '&::after': {
                    content: "''",
                    display: 'block',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(0deg, rgba(50, 52, 51, 0.3), rgba(50, 52, 51, 0.3))',
                  },
                }
              : {
                  ...(noContent && {
                    backgroundColor: bg_color || theme.palette.brand.sage[10],
                  }),
                }),
          })}
        >
          {hasAssetBg && (
            <ImageOrVideo
              video={video}
              image={image}
              loader={{
                ratio: !desktop ? (noContent ? 0.5555 : 0.9777) : aspectRatioConfig[size],
              }}
            />
          )}
        </Stack>
      )}

      {!noContent && (
        <Grid
          container
          direction="column"
          justifyContent="center"
          sx={(theme) => ({
            flexWrap: 'nowrap',
            px: theme.spacing(4),
            py: theme.spacing(10),
            height: '100%',
            [theme.breakpoints.only('xs')]: {
              px: theme.spacing(2),
              py: theme.spacing(3),
            },
            ...(hasAssetBg
              ? {
                  zIndex: 1,
                }
              : {
                  backgroundColor: bg_color || theme.palette.brand.sage[10],
                }),
          })}
        >
          {header && (
            <Typography
              level="h2"
              sx={(theme) => ({
                color: hasAssetBg ? theme.palette.brand.flour[10] : theme.palette.brand.charcoal[800],
              })}
            >
              {header}
            </Typography>
          )}

          {hasRichText(sub_header) && (
            <RichTextTypography
              level="subh2"
              sx={(theme) => ({
                color: hasAssetBg ? theme.palette.brand.flour[10] : theme.palette.brand.charcoal[800],
                mt: theme.spacing(header ? 6 : 0),
                [theme.breakpoints.only('xs')]: {
                  mt: theme.spacing(header ? 2 : 0),
                },
              })}
              description={sub_header}
            />
          )}

          {hasRichText(description) && (
            <RichTextTypography
              level="body2"
              sx={(theme) => ({
                color: hasAssetBg ? theme.palette.brand.flour[10] : theme.palette.brand.charcoal[800],
                mt: theme.spacing(3),
                [theme.breakpoints.only('xs')]: {
                  mt: theme.spacing(1),
                },
              })}
              description={description}
            />
          )}

          {button?.length > 0 && (
            <Stack
              sx={(theme) => ({
                mt: theme.spacing(6),
                [theme.breakpoints.only('xs')]: {
                  mt: theme.spacing(2),
                },
              })}
            >
              {button.map((nestedBlok) => (
                <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
              ))}
            </Stack>
          )}
        </Grid>
      )}
    </Stack>
  );
}

export { TextListing };
