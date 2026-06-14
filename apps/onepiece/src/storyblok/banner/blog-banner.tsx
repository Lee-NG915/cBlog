import React, { useRef } from 'react';
import { Typography, Stack } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react';
import { ButtonProps } from 'storyblok/button';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { getDateAbbr } from 'utils/time';
import { ImageOrVideo } from '../components';

export type BannerProps = {
  blok: {
    _uid?: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    video?: VideoProps[];
    articleTitle?: string;
    author?: string;
    publishDate?: string;
  };
};

function BlogBanner({ blok }: BannerProps) {
  const { desktop } = useBreakpoints();
  const { _uid, articleTitle, image = [], video = [], author, publishDate } = blok || {};

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
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
            ...(video.length > 0 || image.length > 0 ? { zIndex: 1 } : { backgroundColor: '#fff' }),
          })}
        >
          {articleTitle && (
            <Typography
              textAlign="center"
              level="h1"
              sx={(theme) => ({
                color: theme.palette.common.white,
              })}
            >
              {articleTitle}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Stack
        direction="row"
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
        <Typography
          level="body2"
          sx={(theme) => ({
            right: 16,
            color: theme.palette.common.black,
            [theme.breakpoints.up('sm')]: {
              maxWidth: '792px',
            },
          })}
        >
          {author}
        </Typography>
        <Typography
          textAlign="center"
          level="body2"
          sx={(theme) => ({
            color: theme.palette.common.black,
            paddingLeft: 1,
            paddingRight: 1,
            [theme.breakpoints.up('sm')]: {
              maxWidth: '792px',
            },
          })}
        >
          |
        </Typography>
        {publishDate && (
          <Typography
            level="body2"
            sx={(theme) => ({
              left: 16,
              color: theme.palette.common.black,
              width: 'max-content',
              [theme.breakpoints.up('sm')]: {
                maxWidth: '792px',
              },
            })}
          >
            {getDateAbbr(publishDate)}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

export { BlogBanner };
