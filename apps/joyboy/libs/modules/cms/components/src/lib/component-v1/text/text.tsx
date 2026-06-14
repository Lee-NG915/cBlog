'use client';

import React, { useRef } from 'react';
import { Typography, Box, Container } from '@castlery/fortress';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';

import { ButtonProps } from './../button';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useAnchorScroll } from './../hook/anchor';
import { RichTextTypography } from './../components/RichTextTypography';
import { DtStack } from '@castlery/modules-tracking-components';

type RichTextNode = {
  content?: RichTextNode[];
};

type Description = {
  content?: RichTextNode[];
};

const hasRichText = (description: Description | null | undefined): boolean => {
  if (!description || typeof description !== 'object') {
    return false;
  }
  if (!Array.isArray(description.content) || description.content.length === 0) {
    return false;
  }
  if (!Array.isArray(description.content[0].content) || description.content[0].content.length === 0) {
    return false;
  }
  return true;
};

type TextColorType = {
  plugin: string;
  value: string;
};

export type TextBlokProps = {
  _uid?: string;
  with_outline?: boolean;
  button?: ButtonProps[];
  header?: string;
  header_level?: 'h2' | 'h3';
  sub_header?: string;
  sub_header_level?: 'h3' | 'h4';
  description?: string;
  bg_color?: string;
  text_align?: 'left' | 'center' | 'right';
  anchor_link?: string;
  header_color?: TextColorType;
  sub_header_color?: TextColorType;
};
export type TextProps = {
  blok: TextBlokProps;
};

function Text({ blok }: TextProps) {
  const { desktop } = useBreakpoints();
  const {
    _uid,
    with_outline,
    header,
    header_level,
    sub_header,
    sub_header_level,
    description,
    bg_color,
    text_align = 'center',
    button = [],
    anchor_link,
    header_color,
    sub_header_color,
  } = blok || {};

  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  const alignConfig = {
    left: 'start',
    center: 'center',
    right: 'end',
  };

  const selectHeaderLevel = (headerLevel: string) => {
    switch (headerLevel) {
      case 'h2_cursive':
        return 'h2';
      case 'h3_cursive':
        return 'h3';
      case 'h2':
        return 'h2';
      case 'h3':
        return 'h3';
      default:
        return 'h2';
    }
  };

  const selectFontFamily = (headerLevel: string) => {
    switch (headerLevel) {
      case 'h2_cursive':
        return 'var(--font-adelaila),var(--fortress-fontFamily-display)';
      case 'h3_cursive':
        return 'var(--font-adelaila),var(--fortress-fontFamily-display)';
      default:
        return 'var(--fortress-fontFamily-display)';
    }
  };

  const selectFontSize = (headerLevel: string) => {
    switch (headerLevel) {
      case 'h2':
        return 'var(--Typography-fontSize, var(--fortress-fontSize-xl3, 1.5rem))';
      case 'h3':
        return 'var(--Typography-fontSize, var(--fortress-fontSize-xl2, 1.375rem))';
      case 'h2_cursive':
        if (desktop) {
          return '3.75rem';
        }
        return '2.75rem';
      case 'h3_cursive':
        if (desktop) {
          return '3.375rem';
        }
        return '2.5rem';
      default:
        return 'var(--Typography-fontSize, var(--fortress-fontSize-xl3, 1.5rem))';
    }
  };

  return (
    <Container>
      <DtStack
        {...storyblokEditable(blok)}
        useImpression
        componentName="text"
        uid={_uid}
        key={_uid}
        ref={blokRef}
        id={anchor_link?.slice(1)}
        direction="column"
        justifyContent="center"
        alignItems={alignConfig[text_align]}
        sx={(theme) => ({
          gap: theme.spacing(3),
          px: theme.spacing(4),
          py: theme.spacing(6),
          alignItems: 'center',
          backgroundColor: bg_color || 'transparent',
          borderTop: with_outline ? `1px solid ${theme.palette.brand.wheat[200]}` : 'none',
          borderBottom: with_outline ? `1px solid ${theme.palette.brand.wheat[200]}` : 'none',
          [theme.breakpoints.down('sm')]: {
            gap: theme.spacing(2),
            px: theme.spacing(3),
            py: theme.spacing(4),
          },
        })}
      >
        {header && (
          <Typography
            textAlign={text_align}
            level={selectHeaderLevel(header_level || 'h2')}
            sx={(theme) => ({
              color: header_color ? header_color.value : '#000',
              [theme.breakpoints.up('sm')]: {
                maxWidth: '922px',
              },
              fontFamily: selectFontFamily(header_level || 'h2'),
              fontSize: selectFontSize(header_level || 'h2'),
            })}
          >
            {header}
          </Typography>
        )}

        {sub_header && (
          <Typography
            textAlign={text_align}
            component={sub_header_level}
            level={desktop ? 'subh2' : 'subh3'}
            sx={(theme) => ({
              color: sub_header_color ? sub_header_color.value : '#000',
              [theme.breakpoints.up('sm')]: {
                maxWidth: '922px',
              },
            })}
          >
            {sub_header}
          </Typography>
        )}

        {hasRichText(description) && (
          <RichTextTypography
            textAlign={text_align}
            level="body2"
            sx={(theme) => ({
              // alignItems: 'center',
              [theme.breakpoints.up('sm')]: {
                maxWidth: '922px',
              },
            })}
            description={description}
          />
        )}

        {button?.length > 0 && (
          <Box
            sx={(theme) => ({
              pt: theme.spacing(1),
            })}
          >
            {button.map((nestedBlok) => (
              <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
            ))}
          </Box>
        )}
      </DtStack>
    </Container>
  );
}

export { Text };
