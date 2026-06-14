import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type ArrowDownwardProps = IconsProps;

export function ArrowDownward(props: ArrowDownwardProps) {
  return (
    <Icons {...props}>
      <path d="M12.225 19.45 5 12.225l.7-.725 6.025 6.025V5h1v12.525L18.75 11.5l.7.725-7.225 7.225Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
