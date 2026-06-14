'use client';

import React, { useRef } from 'react';
import { Typography, Stack, useBreakpoints } from '@castlery/fortress';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import { ArrowRight } from '@castlery/fortress/Icons';
import { ButtonProps } from '../button';
import { ImageProps } from '../image';
import { useAnchorScroll } from '../hook/anchor';
import { selectHeaderLevel, selectFontFamily, selectFontSize } from '../config/cursive-material-config';
import { CustomLink } from '@castlery/shared-components';
import { useDevice } from '../image/image';
import { DtStack } from '@castlery/modules-tracking-components';

export type BannerProps = {
  blok: {
    _uid?: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    header?: string;
    header_level?: 'h1' | 'h2';
    description?: string;
    link: {
      url?: string;
    };
    bg_color?: string;
    anchor_link?: string;
  };
};

function LinkBanner({ blok }: BannerProps) {
  const { desktop } = useBreakpoints();
  const { _uid, header, header_level, description, link, image = [], bg_color, anchor_link } = blok || {};
  const { url } = link || {};
  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  const device = useDevice();

  const overlayStyles = {
    content: "''",
    display: 'block',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  };

  return (
    <DtStack
      useImpression
      {...storyblokEditable(blok)}
      componentName="link-banner"
      uid={_uid}
      key={_uid}
      ref={blokRef}
      id={anchor_link?.slice(1)}
      sx={() => ({
        position: 'relative',
        a: {
          textDecoration: 'none',
        },
        ...(url && {
          ...(!desktop
            ? {
                '.link-banner-image::after': {
                  ...overlayStyles,
                  background: 'linear-gradient(0deg, rgba(50, 52, 51, 0.2), rgba(50, 52, 51, 0.2))',
                },
              }
            : {
                '&:hover': {
                  '.link-banner-image::after': {
                    ...overlayStyles,
                    background: 'linear-gradient(0deg, rgba(50, 52, 51, 0.3), rgba(50, 52, 51, 0.3))',
                  },
                },
              }),
        }),
      })}
    >
      <CustomLink href={link.url}>
        {image.length > 0 && (
          <Stack
            className="link-banner-image"
            sx={() => ({
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              div: {
                height: '100%',
                div: {
                  '--AspectRatio-paddingBottom': '0 !important',
                },
              },
            })}
          >
            {image.map((nestedBlok) => (
              <StoryblokServerComponent
                blok={nestedBlok}
                key={nestedBlok._uid}
                loader={{
                  ratio: !desktop ? 0.5538 : 0.417,
                }}
                lazy={false}
              />
            ))}
          </Stack>
        )}

        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={(theme) => ({
            position: 'relative',
            paddingLeft: 3,
            paddingRight: 3,
            gap: theme.spacing(1),
            py: theme.spacing(!desktop ? 3 : 12),
            [theme.breakpoints.only('xs')]: {
              gap: 0,
              px: theme.spacing(2),
              py: theme.spacing(6),
            },
            ...(image.length > 0
              ? { zIndex: 1 }
              : {
                  backgroundColor: bg_color,
                  ...(url && {
                    ...(!desktop
                      ? {
                          background: `linear-gradient(0deg, rgba(50, 52, 51, 0.2), rgba(50, 52, 51, 0.2)) ${bg_color}`,
                        }
                      : {
                          '&:hover': {
                            background: `linear-gradient(0deg, rgba(50, 52, 51, 0.3), rgba(50, 52, 51, 0.3)) ${bg_color}`,
                          },
                        }),
                  }),
                }),
          })}
        >
          {header && (
            <Typography
              textAlign="center"
              level={selectHeaderLevel(header_level || 'h1')}
              sx={(theme) => ({
                color: theme.palette.common.white,
                fontFamily: selectFontFamily(header_level || 'h1'),
                fontSize: selectFontSize(header_level || 'h1', device),
                [theme.breakpoints.up('sm')]: {
                  maxWidth: '792px',
                },
              })}
            >
              {header}
            </Typography>
          )}

          <Stack direction="row" alignItems="center" gap={1}>
            {description && (
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
                {description}
              </Typography>
            )}

            {url && (
              <ArrowRight
                fontSize={!desktop ? 'xl5' : 'xl3'}
                sx={(theme) => ({
                  fill: theme.palette.common.white,
                })}
              />
            )}
          </Stack>
        </Stack>
      </CustomLink>
    </DtStack>
  );
}

export { LinkBanner };
