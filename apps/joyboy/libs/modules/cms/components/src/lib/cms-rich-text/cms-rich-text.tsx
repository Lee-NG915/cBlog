'use client';
import { Box, SxProps, Typography, TypographyProps } from '@castlery/fortress';
import { RichTextV2 } from '@castlery/modules-cms-domain';
import { richTextResolver } from '@storyblok/richtext';
const { render } = richTextResolver();

/**
 * https://github.com/storyblok/richtext/
 * https://github.com/storyblok/storyblok-react?tab=readme-ov-file#rendering-rich-text
 */
interface CmsRichTextProps extends TypographyProps {
  description: RichTextV2;
  sx?: SxProps;
  prefix?: any;
  [key: string]: any;
  /**
   * https://github.com/storyblok/storyblok-react?tab=readme-ov-file#rendering-rich-text
   */
  customResolver?: Record<string, any>;
}

export const CmsRichText = (props: CmsRichTextProps) => {
  const { description, sx = [], prefix, customResolver, ...rest } = props;
  return (
    <Typography
      component={'div'}
      sx={[
        {
          'h1,h2,h3,h4,h5,h6,p,ol,ul,dl': {
            my: 0,
          },
          a: {
            color: 'var(--fortress-palette-brand-charcoal-500)',
            textDecorationColor: 'var(--fortress-palette-brand-charcoal-500)',
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
          h1: (theme) => ({
            // 28px
            fontFamily: `var(--fortress-fontFamily-display)`,
            fontWeight: `var(--fortress-fontWeight-md)`,
            lineHeight: `var(--fortress-lineHeight-md)`, // 1.5
            fontDisplay: 'swap',
            fontSize: `${theme.fontSize.xl4} !important`,
            [theme.breakpoints.up('sm')]: {
              // 41px
              fontSize: `${theme.fontSize.xl6} !important`,
            },
          }),
          h2: (theme) => ({
            fontFamily: `var(--fortress-fontFamily-display)`,
            fontWeight: `var(--fortress-fontWeight-md)`,
            lineHeight: `var(--fortress-lineHeight-md)`,
            fontSize: `${theme.fontSize.xl3} !important`,
            [theme.breakpoints.up('sm')]: {
              fontSize: `${theme.fontSize.xl5} !important`,
            },
          }),
          h3: (theme) => ({
            fontFamily: `var(--fortress-fontFamily-display)`,
            fontWeight: `var(--fortress-fontWeight-md)`,
            lineHeight: `var(--fortress-lineHeight-md)`,
            fontSize: `${theme.fontSize.lg} !important`,
            [theme.breakpoints.up('sm')]: {
              fontSize: `${theme.fontSize.xl4} !important`,
            },
          }),
          h4: (theme) => ({
            fontFamily: `var(--fortress-fontFamily-display)`,
            fontWeight: `var(--fortress-fontWeight-md)`,
            lineHeight: `var(--fortress-lineHeight-lg)`,
            // 12px
            fontSize: `${theme.fontSize.xs} !important`,
            [theme.breakpoints.up('sm')]: {
              // 14px
              fontSize: `${theme.fontSize.sm} !important`,
            },
          }),
          h5: (theme) => ({
            fontFamily: `var(--fortress-fontFamily-body)`,
            lineHeight: `var(--fortress-lineHeight-md)`, // 1.5
            color: `var(--fortress-palette-text-primary)`,
            fontWeight: '600',
            fontSize: `${theme.fontSize.lg} !important`,
            [theme.breakpoints.up('sm')]: {
              // 18px
              fontSize: `${theme.fontSize.lg} !important`,
            },
          }),
          h6: (theme) => ({
            fontFamily: `var(--fortress-fontFamily-body)`,
            lineHeight: `var(--fortress-lineHeight-lg)`, // 1.75
            color: `var(--fortress-palette-text-primary)`,
            fontSize: `${theme.fontSize.md} !important`,
            fontWeight: '600',
            [theme.breakpoints.up('sm')]: {
              // 16px
              fontSize: `${theme.fontSize.md} !important`,
            },
          }),
        }}
        dangerouslySetInnerHTML={{
          __html: `${prefix ? render(prefix) : ''}${richTextResolver(customResolver || {}).render(description)}`,
        }}
      />
    </Typography>
  );
};
