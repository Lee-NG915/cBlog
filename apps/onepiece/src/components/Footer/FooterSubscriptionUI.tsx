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
import { ErrorFilled } from '@castlery/fortress/Icons';

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
          '--fortress-fontFamily-body': 'Aime',
          // title
          [`& .${formLabelClasses.root}`]: {
            color: footerPalette.color,
            fontSize: theme.fontSize.lg,
            lineHeight: 1.5,
            fontWeight: 600,
            textTransform: 'inherit',
            mb: 1,
          },
          '& .MuiFormLabel-root': {
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            color: '#f6f3e7',
            '--fortress-palette-text-primary': '#f6f3e7',
            sm: {
              fontSize: '1rem', // 14px
            },
            md: {
              fontSize: '1rem', // 14px
            },
            lg: {
              fontSize: '1.125rem', // 16px
            },
          },

          // input && button
          [`& .${inputClasses.root}, & .${buttonClasses.root}`]: {
            borderColor: footerPalette.color,
            color: footerPalette.color,
          },
          [`& .${inputClasses.root}`]: {
            // focus
            '--Input-focusedHighlight': theme.palette.brand.charcoal[100],

            // input hover
            '--fortress-palette-neutral-outlinedHoverColor': theme.palette.brand.charcoal[100],
            '--fortress-palette-neutral-outlinedHoverBorder': theme.palette.brand.charcoal[10],

            bgcolor: 'transparent',
            ':hover': {
              [`& .${buttonClasses.root}`]: {
                bgcolor: theme.palette.brand.charcoal[100],
              },
            },
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
        <FormLabel>{formLabel}</FormLabel>
        <Input
          variant="outlined"
          sx={{ '--Input-decoratorChildHeight': '48px', '--Input-gap': 0 }}
          placeholder={placeholder}
          type="email"
          required
          value={data.email}
          onChange={(event) => setData({ email: event.target.value.trim(), status: 'initial' })}
          error={data.status === 'failure'}
          endDecorator={
            <Button
              variant="primary"
              loading={data.status === 'loading'}
              type="submit"
              sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            >
              {ctaText}
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
