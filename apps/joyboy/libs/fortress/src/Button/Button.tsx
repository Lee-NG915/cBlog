'use client';
import MButton, { ButtonProps as MButtonProps } from '@mui/joy/Button';
import useBreakpoints from '../hooks/useBreakpoints/useBreakpoints';
import { useMemo, forwardRef, ElementType, ComponentProps } from 'react';
import { useTheme } from '@mui/joy/styles';
import { normalizeFortressSx, type FortressSx } from '../utils/fortress-sx';

type ButtonBaseProps = Omit<MButtonProps, 'component' | 'sx'>;

export type ButtonProps<T extends ElementType = 'button'> = ButtonBaseProps & {
  component?: T;
  imageButtonModule?: boolean; // 添加自定义属性类型
  sx?: FortressSx;
} & Omit<ComponentProps<T>, keyof ButtonBaseProps | 'imageButtonModule' | 'sx'>;

export const Button = forwardRef(function Button<T extends ElementType = 'button'>(
  { component, variant, size, imageButtonModule, sx, ...rest }: ButtonProps<T>,
  ref: React.Ref<Element>
) {
  const { desktop, tablet } = useBreakpoints();
  const theme = useTheme();
  const normalizedSx = useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);
  const newPros = useMemo(() => {
    let props = {};
    switch (variant) {
      case 'primary': {
        props = {
          variant: 'solid',
          color: 'primary',
        };
        break;
      }
      case 'secondary': {
        props = {
          variant: 'outlined',
          color: 'neutral',
        };
        break;
      }
      case 'tertiary': {
        props = {
          variant: 'plain',
          color: 'danger',
        };
        break;
      }
      default: {
        props = {
          variant,
        };
        break;
      }
    }
    return props;
  }, [variant]);

  const props = useMemo(() => {
    if (size) {
      return {
        ...rest,
        ...newPros,
        size,
      };
    }
    if (desktop) {
      return {
        ...rest,
        ...newPros,
        size: 'lg' as const,
      };
    }
    if (tablet) {
      return {
        ...rest,
        ...newPros,
        size: 'md' as const,
      };
    }
    return {
      ...rest,
      ...newPros,
      size: 'sm' as const,
    };
  }, [desktop, newPros, rest, size, tablet]);

  // 将 imageButtonModule 作为 data 属性传递，这样 Joy UI 可以访问但不会产生 warning
  const finalProps = {
    ...props,
    'data-image-button-module': imageButtonModule,
  };

  return <MButton ref={ref} component={component} {...finalProps} sx={normalizedSx} />;
}) as typeof MButton;
