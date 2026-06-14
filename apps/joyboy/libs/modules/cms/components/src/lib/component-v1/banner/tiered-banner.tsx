'use client';

import React, { useRef } from 'react';
import { Typography, Stack, useBreakpoints } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react/rsc';
import { ButtonProps } from './../button';
import { ImageProps } from './../image';
import { VideoProps } from './../video';
import { ImageOrVideo } from '../components';
import { useAnchorScroll } from './../hook/anchor';
import { DtStack } from '@castlery/modules-tracking-components';

export type BannerProps = {
  blok: {
    _uid: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    video?: VideoProps[];
    primary_header?: string;
    primary_header_level?: 'h1' | 'h2';
    primary_header_color?: string;
    primary_description?: string;
    primary_description_color?: string;
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
    primary_header_color,
    primary_description_color,
  } = blok || {};

  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  if (!desktop) {
    return (
      <DtStack
        useImpression
        {...storyblokEditable(blok)}
        uid={_uid}
        key={_uid}
        componentName="tiered-banner"
        ref={blokRef}
        id={anchor_link?.slice(1)}
      >
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
            {primary_header && (
              <Typography
                textAlign="center"
                level={primary_header_level}
                sx={(theme) => ({
                  color: primary_header_color || theme.palette.brand.warmLinen[500],
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
                  color: primary_description_color || theme.palette.brand.warmLinen[500],
                })}
              >
                {primary_description}
              </Typography>
            )}
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
            level="h2"
            sx={(theme) => ({
              color: theme.palette.brand.maroonVelvet[500],
            })}
          >
            {secondary_header}
          </Typography>
          <Typography
            textAlign="center"
            level="body2"
            sx={(theme) => ({
              color: theme.palette.brand.maroonVelvet[500],
            })}
          >
            {secondary_description}
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
      ref={blokRef}
      id={anchor_link?.slice(1)}
      sx={() => ({
        position: 'relative',
        minHeight: '450px',
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
          {primary_header && (
            <Typography
              textAlign="center"
              level={primary_header_level}
              sx={(theme) => ({
                color: primary_header_color || theme.palette.brand.warmLinen[500],
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
              level="body1"
              sx={(theme) => ({
                color: primary_description_color || theme.palette.brand.warmLinen[500],
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
        {secondary_header && (
          <Typography
            textAlign="center"
            level={secondary_header_level}
            sx={(theme) => ({
              color: '#323433',
              // color: theme.palette.brand.maroonVelvet[500],
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
              color: theme.palette.brand.maroonVelvet[500],
              [theme.breakpoints.up('sm')]: {
                maxWidth: '792px',
              },
            })}
          >
            {secondary_description}
          </Typography>
        )}
      </Stack>
    </DtStack>
  );
}

export { TieredBanner };
