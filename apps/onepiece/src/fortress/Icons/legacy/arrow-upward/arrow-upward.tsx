import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type ArrowUpwardProps = IconsProps;

export function ArrowUpward(props: ArrowUpwardProps) {
  return (
    <Icons {...props}>
      <path d="M11.725 19.45V6.925L5.7 12.95l-.7-.725L12.225 5l7.225 7.225-.7.725-6.025-6.025V19.45h-1Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
