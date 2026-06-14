import SvgIcon, { SvgIconProps as _SvgIconProps } from '@mui/joy/SvgIcon';
import { forwardRef, useMemo } from 'react';

/**
 * 自定义 SvgIcon 组件 - Fortress Icons
 *
 * 功能：
 * 1. 基于 Joy UI 的 SvgIcon 组件
 * 2. 集成自定义尺寸 token 支持
 * 3. 支持 CSS 变量控制默认尺寸
 * 4. 向后兼容所有 Joy UI SvgIcon 的 props
 *
 * CSS 变量：
 * - --fortress-icon-width: 图标宽度（默认 24px）
 * - --fortress-icon-height: 图标高度（默认 24px）
 *
 
 *
 * // 自定义尺寸
 * <Icons width={32} height={32}>...</Icons>
 *
 * // 使用 sx 自定义样式
 * <Icons sx={{ color: 'red', fontSize: '2rem' }}>...</Icons>
 * ```
 */

// 扩展 SvgIconProps 以确保类型兼容性
export interface IconsProps extends _SvgIconProps {
  width?: number | string;
  height?: number | string;
}

const Icons = forwardRef<SVGSVGElement, IconsProps>((props, ref) => {
  const { width, height, sx, ...otherProps } = props;

  // 使用 useMemo 来正确处理所有形式的 sx（对象、函数、数组）
  const finalSx = useMemo(() => {
    const baseSx = {
      // 默认尺寸：优先使用传入的 width/height，然后是 CSS 变量，最后是 24px
      width: width ?? 'var(--fortress-icon-width, 24px)',
      height: height ?? 'var(--fortress-icon-height, 24px)',
    };

    if (!sx) {
      return baseSx;
    }

    // 如果 sx 是函数形式：(theme) => ({ color: theme.palette.brand.color })
    if (typeof sx === 'function') {
      return (theme: any) => ({
        ...baseSx,
        ...sx(theme),
      });
    }

    // 如果 sx 是对象形式：{ color: 'red' } 或数组等其他形式
    return {
      ...baseSx,
      ...(sx as any),
    };
  }, [sx, width, height]);

  return <SvgIcon ref={ref} {...otherProps} sx={finalSx} />;
});

Icons.displayName = 'FortressIcon';

export default Icons;
export type { IconsProps as SvgIconProps };
