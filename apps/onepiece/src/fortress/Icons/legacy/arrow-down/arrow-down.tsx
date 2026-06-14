import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type ArrowDownProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

export function ArrowDown(props: ArrowDownProps) {
  return (
    <Icons {...props}>
      <path d="M11.85 21.025L5.5 14.675L6.2 13.975L11.35 19.125V3H12.35V19.125L17.5 13.975L18.2 14.675L11.85 21.025Z" />
    </Icons>
  );
}
