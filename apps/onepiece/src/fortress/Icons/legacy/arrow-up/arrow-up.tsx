import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type ArrowUpProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

export function ArrowUp(props: ArrowUpProps) {
  return (
    <Icons {...props}>
      <path
        d="M11.35 21.025V4.875L6.2 10.05L5.5 9.35L11.85 3L18.2 9.35L17.5 10.075L12.35 4.9V21.025H11.35Z"
      />
    </Icons>
  );
}
