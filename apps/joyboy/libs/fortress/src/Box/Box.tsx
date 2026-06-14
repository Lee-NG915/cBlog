'use client';

import * as React from 'react';
import JoyBox, { type BoxProps as JoyBoxProps } from '@mui/joy/Box';
import { useTheme } from '@mui/joy/styles';
import { normalizeFortressSx, type FortressSx } from '../utils/fortress-sx';

export type BoxProps<T extends React.ElementType = 'div'> = Omit<JoyBoxProps<T>, 'sx'> & {
  sx?: FortressSx;
};

const Box = React.forwardRef(function FortressBox<T extends React.ElementType = 'div'>(
  props: BoxProps<T>,
  ref: React.ForwardedRef<Element>
) {
  const { sx, ...rest } = props;
  const theme = useTheme();
  const normalizedSx = React.useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);

  return <JoyBox ref={ref} {...(rest as JoyBoxProps<T>)} sx={normalizedSx} />;
}) as typeof JoyBox;

// 导出 JoyUI 的所有类型和工具（如 BoxSlot, BoxOwnerState, BoxClasses 等）
// 注意：自定义的 BoxProps 会在后面覆盖 JoyUI 的 BoxProps
export * from '@mui/joy/Box';
export default Box;
