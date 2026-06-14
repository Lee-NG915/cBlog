'use client';

import * as React from 'react';
import JoyStack, { type StackProps as JoyStackProps } from '@mui/joy/Stack';
import { useTheme } from '@mui/joy/styles';
import { normalizeFortressSx, type FortressSx } from '../utils/fortress-sx';

export type StackProps<T extends React.ElementType = 'div'> = Omit<JoyStackProps<T>, 'sx'> & {
  sx?: FortressSx;
};

const Stack = React.forwardRef(function FortressStack<T extends React.ElementType = 'div'>(
  props: StackProps<T>,
  ref: React.ForwardedRef<Element>
) {
  const { sx, ...rest } = props;
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);

  return <JoyStack ref={ref as any} {...(rest as JoyStackProps<T>)} sx={normalizedSx} />;
}) as typeof JoyStack;

export * from '@mui/joy/Stack';
export default Stack;
