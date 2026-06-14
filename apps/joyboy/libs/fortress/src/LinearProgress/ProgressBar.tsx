import { LinearProgress as JoyLinearProgress } from '@mui/joy';
import type { LinearProgressProps } from '@mui/joy/LinearProgress';
import { forwardRef } from 'react';
export * from '@mui/joy/LinearProgress';

export const ProgressBar = forwardRef<HTMLDivElement, LinearProgressProps>((props, ref) => {
  return (
    <JoyLinearProgress
      determinate
      {...props}
      ref={ref}
      sx={{
        // 添加内联样式以确保过渡效果
        '&::before': {
          transition: 'transform 0.4s ease !important',
        },
        '& .MuiLinearProgress-bar::before': {
          transition: 'transform 0.4s ease !important',
        },
        // 合并用户自定义样式
        ...props.sx,
      }}
    />
  );
});

export type { LinearProgressProps as ProgressBarProps };
