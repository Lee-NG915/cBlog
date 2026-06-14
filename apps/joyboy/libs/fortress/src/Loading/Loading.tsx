import React from 'react';
import { CircularProgress as JoyCircularProgress } from '@mui/joy';
import type { CircularProgressProps as JoyCircularProgressProps } from '@mui/joy/CircularProgress';

export interface LoadingProps extends Omit<JoyCircularProgressProps, 'theme'> {
  /**
   * 主题类型
   * @default 'light'
   * @description 可选值：'light' | 'dark'
   */
  theme?: 'light' | 'dark';
}

export const Loading = React.forwardRef<HTMLSpanElement, LoadingProps>(({ theme = 'light', ...props }, ref) => {
  return <JoyCircularProgress ref={ref} color={theme === 'dark' ? 'warning' : 'primary'} {...props} />;
});
Loading.displayName = 'Loading';
// 导出类型

export type { CircularProgressProps as JoyCircularProgressProps } from '@mui/joy/CircularProgress';
