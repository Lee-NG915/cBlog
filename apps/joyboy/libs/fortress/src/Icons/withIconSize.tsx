import { SvgIconProps } from '@mui/joy/SvgIcon';
import React from 'react';

export const withIconSize = (WrappedIcon: React.ComponentType<SvgIconProps>) => {
  return React.memo((props: SvgIconProps) => {
    const { sx, ...otherProps } = props;

    return (
      <WrappedIcon
        {...otherProps}
        style={{
          // fill: 'currentColor',
          width: 'var(--fortress-icon-width, 24px)',
          height: 'var(--fortress-icon-height, 24px)',
        }}
        sx={sx}
      />
    );
  });
};
