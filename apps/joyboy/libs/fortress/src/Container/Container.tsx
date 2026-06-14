import * as React from 'react';
import MContainer, { ContainerProps as MContainerProps } from '@mui/joy/Container';
import { useTheme } from '@mui/joy/styles';
import { normalizeFortressSx, type FortressSx } from '../utils/fortress-sx';

export type ContainerProps = Omit<MContainerProps, 'sx'> & {
  sx?: FortressSx;
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(({ sx, ...props }, ref) => {
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);

  return <MContainer ref={ref} {...props} sx={normalizedSx} />;
});

Container.displayName = 'FortressContainer';

// export { ContainerProps, containerClasses };
export * from '@mui/joy/Container';
