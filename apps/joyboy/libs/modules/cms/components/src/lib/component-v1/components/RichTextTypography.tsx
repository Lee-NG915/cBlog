import React from 'react';
import { TypographyProps } from '@mui/joy/Typography';
import { Typography, Box } from '@castlery/fortress';
import { renderRichText } from '@storyblok/react';
import ReactDOMServer from 'react-dom/server';
import { SxProps } from '@mui/joy/styles/types';

type RichTextTypographyProps = TypographyProps & {
  description: any;
  sx?: SxProps;
  prefix?: any;
  [key: string]: any;
};

const RichTextTypography = ({ description, sx = [], prefix, ...rest }: RichTextTypographyProps) => (
  <Typography
    sx={[
      {
        'h1,h2,h3,h4,h5,h6,p,ol,ul,dl': {
          my: 0,
        },
        a: {
          color: 'var(--fortress-palette-brand-charcoal-500)',
          textDecoration: 'underline',
          '&:hover, &:focus': {
            color: 'var(--fortress-palette-primary-400)',
            textDecoration: 'underline',
          },
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
      [],
    ]}
    {...rest}
  >
    <Box
      sx={{
        '> p': prefix && {
          display: 'inline',
        },
        '> p img': {
          width: '100%',
        },
        '> blockquote': {
          margin: '0 0 1rem',
        },
        '> h2': {
          b: {
            fontFamily: 'MinervaModern',
          },
        },
      }}
      dangerouslySetInnerHTML={{
        __html: (prefix ? ReactDOMServer.renderToString(prefix) : '') + renderRichText(description),
      }}
    />
  </Typography>
);

export { RichTextTypography };
