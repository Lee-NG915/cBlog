import React, { useRef } from 'react';
import { Grid, Typography, Stack } from '@castlery/fortress';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import { ButtonProps } from 'storyblok/button';
import { ImageProps } from 'storyblok/image';
import { VideoProps } from 'storyblok/video';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useAnchorScroll } from '../hooks/anchor';
import { RichTextTypography, ImageOrVideo } from '../components';
import { hasRichText } from '../tool';
import { selectHeaderLevel, selectFontFamily, selectFontSize } from './cursive-material-config';

export type BannerProps = {
  blok: {
    _uid?: string;
    button?: ButtonProps[];
    image?: ImageProps[];
    video?: VideoProps[];
    klaviyo_signup_form?: any[];
    header?: string;
    header_level?: 'h1' | 'h2';
    sub_header?: string;
    sub_header_level?: 'h2' | 'h3';
    description?: string;
    size?: 'large' | 'medium' | 'small';
    bg_color?: string;
    text_align?: 'left' | 'center' | 'right';
    anchor_link?: string;
  };
};

function FullWidthBanner({ blok }: BannerProps) {
  const { desktop, mobile } = useBreakpoints();
  const {
    _uid,
    size = 'large',
    header,
    header_level,
    sub_header,
    sub_header_level,
    description,
    bg_color,
    text_align = 'center',
    image = [],
    video = [],
    button = [],
    anchor_link,
    klaviyo_signup_form = [],
  } = blok || {};

  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  const pxConfig = {
    large: 36,
    medium: 12,
    small: 7,
  };
  const alignConfig = {
    left: 'start',
    center: 'center',
    right: 'end',
  };
  const aspectRatioConfig = {
    large: 0.5283,
    medium: 0.2881,
    small: 0.1921,
  };

  return (
    <Stack
      {...storyblokEditable(blok)}
      key={_uid}
      ref={blokRef}
      sx={() => ({
        position: 'relative',
      })}
      id={anchor_link?.slice(1)}
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
          })}
        >
          <ImageOrVideo
            video={video}
            image={image}
            loader={{
              ratio: !desktop ? 1.7025 : aspectRatioConfig[size],
            }}
          />
        </Stack>
      )}

      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems={alignConfig[text_align]}
        sx={(theme) => ({
          flexWrap: 'nowrap',
          gap: theme.spacing(2),
          px: theme.spacing(6),
          py: theme.spacing(pxConfig[size]),
          height: '100%',
          [theme.breakpoints.only('xs')]: {
            px: theme.spacing(4),
            py: theme.spacing(24),
          },
          ...(video.length > 0 || image.length > 0
            ? {
                zIndex: 1,
              }
            : {
                backgroundColor: bg_color || theme.palette.brand.charcoal[800],
              }),
        })}
      >
        {header && (
          <Typography
            textAlign={text_align}
            level={selectHeaderLevel(header_level || 'h1')}
            sx={(theme) => ({
              color: theme.palette.brand.flour[10],
              [theme.breakpoints.up('sm')]: {
                maxWidth: '828px',
              },
              fontFamily: selectFontFamily(header_level || 'h1'),
              fontSize: selectFontSize(header_level || 'h1'),
            })}
          >
            {header}
          </Typography>
        )}

        {sub_header && (
          <Typography
            textAlign={text_align}
            component={sub_header_level}
            level="subh1"
            sx={(theme) => ({
              color: theme.palette.brand.flour[10],
              fontFamily: theme.fontFamily.body,
              [theme.breakpoints.up('sm')]: {
                maxWidth: '828px',
              },
            })}
          >
            {sub_header}
          </Typography>
        )}

        {hasRichText(description) && (
          <RichTextTypography
            textAlign={text_align}
            level="body1"
            sx={(theme) => ({
              color: theme.palette.brand.flour[10],
              [theme.breakpoints.up('sm')]: {
                maxWidth: '828px',
              },
            })}
            description={description}
          />
        )}

        {button?.length > 0 && (
          <Stack>
            {button.map((nestedBlok) => (
              <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
            ))}
          </Stack>
        )}
        {klaviyo_signup_form?.length > 0 && (
          <Stack
            sx={{
              width: mobile ? '342px' : '520px',
            }}
          >
            {klaviyo_signup_form.map((nestedBlok) => (
              <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />
            ))}
          </Stack>
        )}
      </Grid>
    </Stack>
  );
}

export { FullWidthBanner };
