import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type PushPinProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

export function PushPin(props: PushPinProps) {
  return (
    <Icons {...props}>
      <path d="M15.075 11.925 16.65 13.5v1h-4.075v5l-.5.5-.5-.5v-5H7.5v-1l1.575-1.575V4.5h-1v-1h8v1h-1v7.425ZM8.925 13.5h6.3l-1.15-1.15V4.5h-4v7.85l-1.15 1.15Z" />
    </Icons>
  );
}
