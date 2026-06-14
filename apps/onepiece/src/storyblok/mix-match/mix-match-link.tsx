import React, { useRef } from 'react';
import { Typography, Stack } from '@castlery/fortress';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import { ButtonProps } from 'storyblok/button';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useAnchorScroll } from '../hooks/anchor';
import { RichTextTypography, ImageOrVideo } from '../components';
import { hasRichText } from '../tool';

export type MixMatchLinkProps = {
  blok: {
    _uid?: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    video?: VideoProps[];
    header?: string;
    description?: string;
    size?: 'large' | 'medium';
    anchor_link?: string;
  };
};

function MixMatchLink({ blok }: MixMatchLinkProps) {
  const { desktop } = useBreakpoints();
  const { _uid, size = 'large', header, description, image = [], video = [], button = [], anchor_link } = blok || {};

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
      justifyContent="space-between"
      sx={(theme) => ({
        position: 'relative',
        height: '100%',
        width: size === 'large' ? '59%' : '41%',
        border: `1px solid ${theme.palette.brand.wheat[600]}`,
        [theme.breakpoints.down('sm')]: {
          width: '100%',
        },
        ...(hasText ? {} : { div: { height: '100%' } }),
      })}
    >
      <ImageOrVideo
        video={video}
        image={image}
        loader={{
          ratio: !desktop ? 1.391 : aspectRatioConfig[size],
        }}
      />

      {hasText && (
        <Stack
          direction="column"
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
          {header && (
            <Typography level="h2" sx={(theme) => ({})}>
              {header}
            </Typography>
          )}

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
        </Stack>
      )}
      {button?.length > 0 && (
        <Stack
          sx={(theme) => ({
            width: '100%',
          })}
        >
          {button.map((nestedBlok) => (
            <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} fullWidth type="full-width" />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export { MixMatchLink };
