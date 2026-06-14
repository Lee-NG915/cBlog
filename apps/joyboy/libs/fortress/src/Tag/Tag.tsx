import Chip from '@mui/joy/Chip';
import type { ChipProps as TagProps } from '@mui/joy/Chip';
import { chipClasses as tagClasses } from '@mui/joy/Chip';
import { forwardRef } from 'react';

export interface ExtendedTagProps extends TagProps {
  /**
   * 标签内容
   */
  children?: React.ReactNode;
  /**
   * 是否将标签内容转换为大写
   * @default true
   */
  uppercase?: boolean;
}

export const Tag = forwardRef<HTMLDivElement, ExtendedTagProps>(({ children, uppercase = true, sx, ...props }, ref) => {
  const content = uppercase && typeof children === 'string' ? children.toUpperCase() : children;

  return (
    <Chip
      ref={ref}
      sx={(theme) => {
        const toPx = (v: unknown) => (typeof v === 'number' ? `${v}px` : String(v));
        const blockPadding =
          props.variant === 'outlined' ? `calc(${toPx(theme.spacing(1))} - 1px)` : toPx(theme.spacing(1));
        const inlinePadding = toPx(theme.spacing(1));

        const baseStyles = {
          '& .MuiChip-startDecorator': {
            svg: {
              '--fortress-icon-width': '12px',
              '--fortress-icon-height': '12px',
            },
          },
          '& .MuiChip-endDecorator': {
            svg: {
              '--fortress-icon-width': '12px',
              '--fortress-icon-height': '12px',
            },
          },
          padding: `${blockPadding} ${inlinePadding}`,
          ...theme.typography.caption2,
        } as const;

        const userStyles = typeof sx === 'function' ? (sx as any)(theme) : sx;
        return { ...baseStyles, ...(userStyles || {}) } as any;
      }}
      {...props}
    >
      {content}
    </Chip>
  );
});

Tag.displayName = 'Tag';

export { tagClasses };
export type { TagProps };
