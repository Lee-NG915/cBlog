import { Typography as JoyTypography } from '@mui/joy';
import type { TypographyProps as JoyTypographyProps } from '@mui/joy';
import { forwardRef, useMemo } from 'react';
import { useTheme } from '@mui/joy/styles';
import { normalizeFortressSx, type FortressSx } from '../utils/fortress-sx';

// 扩展原有的Props类型
export interface FortressTypographyProps extends Omit<JoyTypographyProps, 'level' | 'sx'> {
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'subh1' | 'subh2' | 'subh3' | 'body1' | 'body2' | 'caption1' | 'caption2';
  sx?: FortressSx;
}

export const Typography = forwardRef<HTMLDivElement, FortressTypographyProps>(
  ({ level = 'body1', sx, ...props }, ref) => {
    const theme = useTheme();
    const normalizedSx = useMemo(() => normalizeFortressSx(sx, theme), [sx, theme]);

    return <JoyTypography level={level} {...props} sx={normalizedSx} ref={ref} />;
  }
);

// 添加默认导出
export default Typography;
