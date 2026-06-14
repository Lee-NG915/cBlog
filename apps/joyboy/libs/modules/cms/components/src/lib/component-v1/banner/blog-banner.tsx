'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Stack } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react/rsc';
import { ButtonProps } from '../button';
import { ImageProps } from '../image';
import { VideoProps } from '../video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { ImageOrVideo } from './../components/ImageOrVideo';
import { DtStack } from '@castlery/modules-tracking-components';

const getDateAbbr = (date: string) => {
  const nowDate = new Date(date);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = nowDate.getMonth();
  const monthName = monthNames[monthIndex];

  const day = nowDate.getDate();
  const year = nowDate.getFullYear();

  return `${monthName} ${`0${day}`.slice(-2)}, ${year}`;
};

export type BannerProps = {
  blok: {
    _uid: string;
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

  if (!desktop) {
    return (
      <DtStack useImpression {...storyblokEditable(blok)} uid={_uid} key={_uid} componentName="tiered-banner">
        <Stack
          sx={() => ({
            position: 'relative',
            maxHeight: '260px',
            minHeight: '260px',
            ...(video.length > 0 || image.length > 0 ? { zIndex: 1 } : { backgroundColor: bg_color }),
            justifyContent: 'center',
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
                  ratio: 0.5307,
                }}
                lazy={false}
                sizes={['1-xs', '1-sm']}
              />
            </Stack>
          )}

          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={(theme) => ({
              gap: '24px',
              py: '44px',
              px: '24px',
            })}
          >
            <Typography
              textAlign="center"
              level="h1"
              sx={(theme) => ({
                color: theme.palette.brand.warmLinen[500],
              })}
            >
              {articleTitle}
            </Typography>
          </Stack>
        </Stack>
        <Stack
          sx={(theme) => ({
            backgroundColor: theme.palette.brand.warmLinen[500],
            padding: '24px',
          })}
        >
          <Typography
            textAlign="center"
            level="body2"
            sx={(theme) => ({
              color: theme.palette.brand.maroonVelvet[500],
            })}
          >
            {`${author} | ${getDateAbbr(publishDate || '')}`}
          </Typography>
        </Stack>
      </DtStack>
    );
  }

  return (
    <DtStack
      useImpression
      {...storyblokEditable(blok)}
      uid={_uid}
      key={_uid}
      componentName="tiered-banner"
      sx={() => ({
        position: 'relative',
        maxHeight: '450px',
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
                ratio: !desktop ? 0.5307 : 0.182,
              }}
              lazy={false}
              sizes={['1-xs', '1-sm', '1-lg', '0.8-xl']}
            />
          </Stack>
        )}

        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={(theme) => ({
            gap: '24px',
            py: '96.5px',
            [theme.breakpoints.only('xs')]: {
              gap: 0,
              px: theme.spacing(2),
              py: theme.spacing(6),
            },
            ...(video.length > 0 || image.length > 0 ? { zIndex: 1 } : { backgroundColor: bg_color }),
          })}
        >
          <Typography
            textAlign="center"
            level="h1"
            sx={(theme) => ({
              color: theme.palette.brand.warmLinen[500],
              [theme.breakpoints.up('sm')]: {
                maxWidth: '792px',
              },
            })}
          >
            {articleTitle}
          </Typography>
        </Stack>
      </Stack>

      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={(theme) => ({
          gap: theme.spacing(1),
          position: 'relative',
          backgroundColor: '#fff',
          // backgroundColor: theme.palette.brand.warmLinen[500],
          padding: '40px 32px',
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
          textAlign="center"
          level="body2"
          sx={(theme) => ({
            color: theme.palette.brand.maroonVelvet[500],
            [theme.breakpoints.up('sm')]: {
              maxWidth: '792px',
            },
          })}
        >
          {`${author} | ${getDateAbbr(publishDate || '')}`}
        </Typography>
      </Stack>
    </DtStack>
  );
}

export { BlogBanner };
