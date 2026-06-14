'use client';

import * as React from 'react';
import JoyGrid, { type GridProps as JoyGridProps } from '@mui/joy/Grid';
import { useTheme } from '@mui/joy/styles';
import { normalizeFortressSx, type FortressSx } from '../utils/fortress-sx';

export type GridProps<T extends React.ElementType = 'div'> = Omit<JoyGridProps<T>, 'sx'> & {
  sx?: FortressSx;
};

const Grid = React.forwardRef(function FortressGrid<T extends React.ElementType = 'div'>(
  props: GridProps<T>,
  ref: React.ForwardedRef<Element>
) {
  const { sx, ...rest } = props;
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);

  return <JoyGrid ref={ref as any} {...(rest as JoyGridProps<T>)} sx={normalizedSx} />;
}) as typeof JoyGrid;

export * from '@mui/joy/Grid';
export default Grid;
