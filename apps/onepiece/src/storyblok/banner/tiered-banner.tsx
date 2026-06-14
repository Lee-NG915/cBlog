import React, { useRef } from 'react';
import { Typography, Stack } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react';
import { ButtonProps } from 'storyblok/button';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { ImageOrVideo } from '../components';
import { useAnchorScroll } from '../hooks/anchor';

export type BannerProps = {
  blok: {
    _uid?: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    video?: VideoProps[];
    primary_header?: string;
    primary_header_level?: 'h1' | 'h2';
    primary_description?: string;
    secondary_header?: string;
    secondary_header_level?: 'h2' | 'h3';
    secondary_description?: string;
    bg_color?: string;
    anchor_link?: string;
  };
};

function TieredBanner({ blok }: BannerProps) {
  const { desktop } = useBreakpoints();
  const {
    _uid,
    primary_header,
    primary_header_level,
    primary_description,
    secondary_header,
    secondary_header_level,
    secondary_description,
    image = [],
    video = [],
    bg_color,
    anchor_link,
  } = blok || {};

  const blokRef = useRef(null);
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
      sx={() => ({
        position: 'relative',
      })}
    >
      <Stack
        sx={() => ({
          position: 'relative',
        })}
      >
        {(video.length > 0 || image.length > 0) && (
          <Stack
            sx={() => ({
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              div: {
                height: '100%',
                paddingTop: '0 !important',
              },
              '&::after': {
                content: "''",
                display: 'block',
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(0deg, rgba(50, 52, 51, 0.2), rgba(50, 52, 51, 0.2))',
              },
            })}
          >
            <ImageOrVideo
              video={video}
              image={image}
              loader={{
                ratio: !desktop ? 0.5307 : 0.417,
              }}
              lazy={false}
            />
          </Stack>
        )}

        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={(theme) => ({
            gap: theme.spacing(2),
            pt: theme.spacing(12),
            pb: theme.spacing(13),
            [theme.breakpoints.only('xs')]: {
              gap: 0,
              px: theme.spacing(2),
              py: theme.spacing(6),
            },
            ...(video.length > 0 || image.length > 0 ? { zIndex: 1 } : { backgroundColor: bg_color }),
          })}
        >
          {primary_header && (
            <Typography
              textAlign="center"
              level={primary_header_level}
              sx={(theme) => ({
                color: theme.palette.common.white,
                [theme.breakpoints.up('sm')]: {
                  maxWidth: '792px',
                },
              })}
            >
              {primary_header}
            </Typography>
          )}

          {primary_description && (
            <Typography
              textAlign="center"
              level="body2"
              sx={(theme) => ({
                color: theme.palette.common.white,
                [theme.breakpoints.up('sm')]: {
                  maxWidth: '792px',
                },
              })}
            >
              {primary_description}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={(theme) => ({
          gap: theme.spacing(1),
          position: 'relative',
          backgroundColor: theme.palette.common.white,
          px: theme.spacing(4),
          py: theme.spacing(6),
          [theme.breakpoints.up('sm')]: {
            width: '64.35%',
            margin: `${theme.spacing(-10)} auto 0`,
          },
          [theme.breakpoints.only('xs')]: {
            gap: 0,
            px: theme.spacing(2),
            py: theme.spacing(3),
          },
        })}
      >
        {secondary_header && (
          <Typography
            textAlign="center"
            level={secondary_header_level}
            sx={(theme) => ({
              [theme.breakpoints.up('sm')]: {
                maxWidth: '792px',
              },
            })}
          >
            {secondary_header}
          </Typography>
        )}

        {secondary_description && (
          <Typography
            textAlign="center"
            level="body2"
            sx={(theme) => ({
              [theme.breakpoints.up('sm')]: {
                maxWidth: '792px',
              },
            })}
          >
            {secondary_description}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

export { TieredBanner };
