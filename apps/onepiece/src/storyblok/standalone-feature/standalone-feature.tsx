import React, { useRef } from 'react';
import { Stack, Typography, Box, Container } from '@castlery/fortress';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import { ButtonProps } from 'storyblok/button';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { RichTextTypography, ImageOrVideo } from '../components';
import { hasRichText } from '../tool';
import { useNumberOfLines } from '../hooks/lines';
import { useAnchorScroll } from '../hooks/anchor';

export type BannerProps = {
  blok: {
    _uid?: string;
    text_direction?: 'left' | 'right';
    header?: string;
    description?: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    video?: VideoProps[];
    caption?: object;
    anchor_link?: string;
  };
};

function StandaloneFeature({ blok }: BannerProps) {
  const { desktop } = useBreakpoints();
  const { _uid, text_direction, header, description, image = [], video = [], button = [], caption, anchor_link } = blok;
  const headerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lineNum = useNumberOfLines(headerRef);
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
          position: 'relative',
          [theme.breakpoints.up('sm')]: {
            height: '587px',
          },
          [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
          },
        })}
      >
        <Stack
          sx={(theme) => ({
            borderTop: `1px solid ${theme.palette.brand.wheat[500]}`,
            borderBottom: `1px solid ${theme.palette.brand.wheat[500]}`,
            position: 'absolute',
            left: '30px',
            right: '30px',
            alignItems: text_direction === 'left' ? 'flex-start' : 'flex-end',
            [theme.breakpoints.up('xl')]: {
              left: 0,
              right: 0,
            },
            [theme.breakpoints.down('sm')]: {
              position: 'relative',
              left: 0,
              right: 0,
              width: '100%',
              alignItems: 'flex-start',
            },
          })}
        >
          {header && (
            <Typography
              ref={headerRef}
              level="h2"
              textAlign={text_direction === 'left' ? 'left' : 'right'}
              sx={(theme) => ({
                width: '36%',
                whiteSpace: 'pre-line',
                [theme.breakpoints.down('sm')]: {
                  width: '100%',
                  textAlign: 'left',
                },
              })}
            >
              {header}
            </Typography>
          )}

          {lineNum > 1 &&
            Array.from({ length: lineNum - 1 }, (_, i) => (
              <Box
                key={i}
                sx={(theme) => ({
                  width: '100%',
                  borderBottom: `1px solid ${theme.palette.brand.wheat[500]}`,
                  position: 'absolute',
                  left: 0,
                  top: `${((i + 1) / lineNum) * 100}%`,
                })}
              />
            ))}
        </Stack>

        <Stack
          direction="row"
          sx={(theme) => ({
            flexDirection: text_direction === 'left' ? 'row-reverse' : 'row',
            position: 'relative',
            gap: theme.spacing(14),
            height: '100%',
            [theme.breakpoints.down('sm')]: {
              flexDirection: 'column',
              gap: theme.spacing(3),
            },
          })}
        >
          <Stack
            justifyContent="space-between"
            sx={(theme) => ({
              width: '64%',
              position: 'relative',
              mt: theme.spacing(4),
              '> div:first-of-type': {
                flex: 1,
                div: {
                  height: '100%',
                },
              },
              [theme.breakpoints.down('sm')]: {
                width: '100%',
                mt: theme.spacing(3),
                alignSelf: 'start',
              },
            })}
          >
            <ImageOrVideo
              video={video}
              image={image}
              loader={{
                ratio: !desktop ? 0.6703 : caption ? 0.5261 : 0.5593,
              }}
            />

            {hasRichText(caption) && (
              <RichTextTypography
                textAlign="right"
                level="caption1"
                sx={(theme) => ({
                  mt: theme.spacing(1),
                  [theme.breakpoints.down('sm')]: {
                    mt: 0,
                    fontSize: theme.fontSize.xs,
                  },
                })}
                description={caption}
              />
            )}
          </Stack>

          <Stack
            ref={textRef}
            sx={(theme) => ({
              width: '36%',
              pl: theme.spacing(7),
              pt: theme.spacing(lineNum * 8 + 12),
              alignItems: text_direction === 'left' ? 'flex-start' : 'flex-end',
              [theme.breakpoints.down('sm')]: {
                width: '100%',
                pl: 0,
                py: 0,
                alignItems: 'flex-start',
              },
            })}
          >
            <Typography
              level={desktop ? 'caption1' : 'body2'}
              textAlign={text_direction === 'left' ? 'left' : 'right'}
              sx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  textAlign: 'left',
                },
              })}
            >
              {description}
            </Typography>

            {button?.length > 0 && (
              <Stack
                sx={(theme) => ({
                  mt: theme.spacing(4),
                  [theme.breakpoints.down('sm')]: {
                    mt: theme.spacing(1),
                  },
                  button: {
                    ...(button[0].variant === 'tertiary' && {
                      pl: 0,
                      pr: 0,
                    }),
                  },
                })}
              >
                {button.map((nestedBlok) => (
                  <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}

export { StandaloneFeature };
