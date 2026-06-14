import MIconButton, { IconButtonProps as MIconButtonProps } from '@mui/joy/IconButton';
import { forwardRef, useMemo } from 'react';

export type IconButtonProps = MIconButtonProps;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const { variant, ...rest } = props;
  //   const { desktop, tablet } = useBreakpoints();
  const newProps = useMemo(() => {
    let props: MIconButtonProps = {};
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
      case 'image': {
        props = {
          variant: 'soft',
          color: 'warning',
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

  return <MIconButton ref={ref} {...newProps} {...rest} />;
});

IconButton.displayName = 'IconButton';
