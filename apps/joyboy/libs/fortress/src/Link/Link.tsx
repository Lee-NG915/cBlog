// TODO 下划线弄个动画
import MLink, { LinkProps as MLinkProps } from '@mui/joy/Link';
import { ElementType, forwardRef, useMemo } from 'react';
import { useTheme } from '@mui/joy/styles';
import { normalizeFortressSx, type FortressSx } from '../utils/fortress-sx';

export * from '@mui/joy/Link';

// export const Link: typeof MLink = MLink;

export const Link = forwardRef(function Link<T extends ElementType = 'a'>(
  { component, variant, sx, ...rest }: Omit<MLinkProps<T>, 'sx'> & { sx?: FortressSx },
  ref: React.ForwardedRef<Element>
) {
  const theme = useTheme();
  const normalizedSx = useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);
  const newProps = useMemo(() => {
    let props = {};
    switch (variant) {
      case 'primary': {
        props = {
          variant: 'plain',
          color: 'warning',
        };
        break;
      }
      case 'secondary': {
        props = {
          variant: 'plain',
          color: 'neutral',
        };
        break;
      }
      case 'tertiary': {
        props = {
          variant: 'plain',
          color: 'tertiary',
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

  return <MLink component={component || 'a'} ref={ref as any} {...newProps} {...rest} sx={normalizedSx} />;
}) as typeof MLink;
