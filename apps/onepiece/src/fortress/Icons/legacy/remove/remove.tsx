import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type RemoveProps = IconsProps;

export function Remove(props: RemoveProps) {
  return (
    <Icons {...props}>
      <path d="M5.5 12.5v-1h13v1h-13Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
