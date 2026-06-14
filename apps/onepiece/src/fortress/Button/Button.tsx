import { svgIconClasses } from '@mui/joy/SvgIcon';
import MButton, { ButtonProps } from '@mui/joy/Button';
import React, { forwardRef } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(inProps, ref) {
  let { variant, ...rest } = inProps;
  let newPros: ButtonProps = {};
  switch (variant) {
    case 'primary': {
      newPros = {
        variant: 'solid',
        color: 'primary',
      };
      break;
    }
    case 'secondary': {
      newPros = {
        variant: 'outlined',
        color: 'neutral',
        sx: (theme) => ({
          transition: 'background-color 0.2s',
          ':hover': {
            bgcolor: theme.palette.primary[500],
            color: theme.palette.common.white,
            [`.${svgIconClasses.root}`]: {
              color: theme.vars.palette.common.white,
            },
          },
        }),
      };
      break;
    }
    case 'tertiary': {
      newPros = {
        variant: 'plain',
        color: 'neutral',
        sx: (theme) => ({
          ':hover': {
            [`.${svgIconClasses.root}`]: {
              color: theme.palette.primary[400],
            },
          },
          ':active': {
            [`.${svgIconClasses.root}`]: {
              color: theme.palette.brand.terracotta[700],
            },
          },
        }),
      };
    }
    default:
      break;
  }
  let props = {
    ...newPros,
    ...rest,
  };
  return <MButton {...props} ref={ref} />;
});
