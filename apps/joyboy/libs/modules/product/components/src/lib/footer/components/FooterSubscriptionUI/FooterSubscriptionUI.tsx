import * as React from 'react';
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Typography,
  buttonClasses,
  formLabelClasses,
  inputClasses,
} from '@castlery/fortress';
import { ErrorFilled, RightArrow } from '@castlery/fortress/Icons';

type DataType = { email: string; status: 'initial' | 'loading' | 'failure' | 'sent' };

export type FooterSubscriptionUIType = {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  data: DataType;
  setData: ({ email, status }: DataType) => void;
  footerPalette: {
    color: string;
    bg: string;
    hoverBg: string;
    activeBg: string;
    disableColor: string;
    disableBg: string;
  };
  error: string;
  placeholder: string;
  ctaText: string;
  formLabel: string;
};

export function FooterSubscriptionUI({
  handleSubmit,
  data,
  setData,
  footerPalette,
  error,
  placeholder = 'placeholder',
  ctaText = 'submit',
  formLabel = 'formLabel',
}: FooterSubscriptionUIType) {
  return (
    <form onSubmit={handleSubmit} id="footer-subscription">
      <FormControl
        sx={(theme) => ({
          '--Input-gap': 0,
          // title
          [`& .${formLabelClasses.root}`]: {
            color: footerPalette.color,
            fontSize: theme.fontSize.lg,
            lineHeight: 1.5,
            fontWeight: 600,
            textTransform: 'inherit',
            mb: 1,
          },

          // input && button
          [`& .${inputClasses.root}, & .${buttonClasses.root}`]: {
            borderColor: footerPalette.color,
            color: footerPalette.color,
          },
          [`& .${inputClasses.root}`]: {
            // input hover
            '--fortress-palette-neutral-outlinedHoverColor': theme.palette.brand.charcoal[100],
            '--fortress-palette-neutral-outlinedHoverBorder': theme.palette.brand.charcoal[10],

            bgcolor: 'transparent',
            ':hover': {
              [`& .${buttonClasses.root}`]: {
                bgcolor: theme.palette.brand.charcoal[100],
              },
            },
            // focus
            '&::before': {
              '--Input-focusedHighlight': theme.palette.brand.charcoal[100],
            },
          },

          [`& .${buttonClasses.root}`]: {
            bgcolor: 'rgba(255, 253, 249, 0.7)',
            color: footerPalette.bg,
            '&:hover': {
              bgcolor: theme.palette.brand.charcoal[100],
            },
          },
          [`& .${buttonClasses.disabled}`]: {
            color: 'transparent',
          },
        })}
      >
        <FormLabel>
          <Typography
            level="h5"
            sx={{
              fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
              fontWeight: '400 !important',
            }}
          >
            {formLabel}
          </Typography>
        </FormLabel>
        <Input
          id="footer-newsletter-email"
          variant="outlined"
          sx={{
            '--Input-decoratorChildHeight': '48px',
            '--Input-gap': 0,
            border: 'none',
            borderBottom: '1px solid #fffdf9',
            '&:hover': {
              borderBottom: '1px solid #fffdf9',
            },
            '&::before': {
              // borderBottom: '1px solid #fffdf9 !important',
              '--Input-focusedHighlight': 'transparent !important',
              height: '48px !important',
              top: '-3px',
              right: '-2px',
            },
          }}
          placeholder={placeholder}
          type="email"
          required
          value={data.email}
          onChange={(event) => setData({ email: event.target.value.trim(), status: 'initial' })}
          error={data.status === 'failure'}
          endDecorator={
            <Button
              aria-label="Submit"
              variant="solid"
              loading={data.status === 'loading'}
              type="submit"
              sx={(theme) => ({
                padding: 0,
                maxWidth: '32px',
                maxHeight: '32px',
                minWidth: '32px',
                minHeight: '32px',
                borderRadius: '50%',
                marginBottom: '50%',
                border: 'none',
                backgroundColor: `${theme.palette.brand.warmLinen[500]} !important`,
                '&:hover': {
                  backgroundColor: `${theme.palette.brand.warmLinen[600]} !important`,
                },
                '&:active': {
                  backgroundColor: `${theme.palette.brand.warmLinen[800]} !important`,
                },
              })}
            >
              <RightArrow
                sx={(theme) => ({
                  fill: theme.palette.brand.terracotta[500],
                  width: '16px',
                  height: '16px',
                })}
              />
            </Button>
          }
        />
        {data.status === 'failure' && (
          <FormHelperText
            sx={(theme) => ({
              color: theme.palette.danger[200],
            })}
            component={Typography}
            startDecorator={<ErrorFilled />}
            level="caption1"
          >
            {error}
          </FormHelperText>
        )}
      </FormControl>
    </form>
  );
}
