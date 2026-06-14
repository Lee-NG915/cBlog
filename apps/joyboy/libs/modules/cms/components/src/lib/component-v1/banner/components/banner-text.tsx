'use client';

import React from 'react';
import { Typography, Stack, SxProps } from '@castlery/fortress';
import { StoryblokServerComponent } from '@storyblok/react/rsc';
import { ButtonProps } from './../../button';
import { RichTextTypography } from '../../components';
import { selectHeaderLevel, selectFontFamily, selectFontSize } from './../../config/cursive-material-config';
import { useDevice } from '../../image/image';

export type BannerProps = {
  button?: ButtonProps[];
  header?: string;
  header_level?: 'h1' | 'h2';
  sub_header?: string;
  sub_header_level?: 'h2' | 'h3';
  description?: string;
  size?: 'large' | 'medium' | 'small';
  forwardRef?: any;
  pxConfig?: {
    large?: number;
    medium?: number;
    small?: number;
  };
  bgColor?: string;
  sx?: SxProps;
  [key: string]: any;
};

function BannerText(props: BannerProps) {
  const {
    size = 'large',
    header,
    header_level,
    sub_header,
    sub_header_level,
    description,
    button = [],
    forwardRef,
    pxConfig,
    bgColor,
    sx = [],
    ...rest
  } = props;

  const device = useDevice();

  return (
    <Stack
      ref={forwardRef}
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={(theme) => ({
        px: theme.spacing(6),
        py: theme.spacing(pxConfig[size]),
        bgcolor: bgColor || theme.palette.brand.sage[800],
        width: '32%',
        [theme.breakpoints.down('sm')]: {
          width: '100%',
          px: theme.spacing(2),
          py: theme.spacing(10),
        },
        ...(typeof sx === 'function' ? sx(theme) : sx),
      })}
      {...rest}
    >
      {header && (
        <Typography
          textAlign="center"
          level={selectHeaderLevel(header_level || 'h1')}
          sx={(theme) => ({
            color: theme.palette.brand.flour[10],
            fontFamily: selectFontFamily(header_level || 'h1'),
            fontSize: selectFontSize(header_level || 'h1', device),
          })}
        >
          {header}
        </Typography>
      )}

      {sub_header && (
        <Typography
          textAlign="center"
          component={sub_header_level}
          level="subh1"
          sx={(theme) => ({
            color: theme.palette.brand.flour[10],
            mt: theme.spacing(2),
          })}
        >
          {sub_header}
        </Typography>
      )}

      {description && (
        <RichTextTypography
          textAlign="center"
          level="body1"
          sx={(theme) => ({
            color: theme.palette.brand.flour[10],
            mt: theme.spacing(1),
          })}
          description={description}
        />
      )}

      {button && (
        <Stack
          sx={(theme) => ({
            mt: theme.spacing(2),
          })}
        >
          {button.map((nestedBlok) => (
            <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default BannerText;
