import React from 'react';
import MTooltip from '@mui/joy/Tooltip';
import type { TooltipProps as MTooltipProps } from '@mui/joy/Tooltip';
/**
 * @xxxx
 */
export type TooltipProps = Omit<MTooltipProps, 'theme'> & {
  /**
   * 主题类型
   * @default 'light'
   * @description 可选值：'light' | 'dark'
   */
  theme?: 'light' | 'dark';
};

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(({ theme = 'light', ...props }, ref) => {
  const mappedVariant = theme === 'dark' ? 'solid' : 'soft';
  return <MTooltip ref={ref} variant={props?.variant || mappedVariant} {...props} />;
});

Tooltip.displayName = 'Tooltip';
export * from '@mui/joy/Tooltip';
export default Tooltip;
