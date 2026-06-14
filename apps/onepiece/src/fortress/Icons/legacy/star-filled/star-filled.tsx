import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type StarFilledProps = IconsProps;

export function StarFilled(props: StarFilledProps) {
  return (
    <Icons {...props}>
      <path d="M7.375 19.375L8.625 14.05L4.5 10.5L9.925 10.025L12.05 5L14.175 10.025L19.6 10.5L15.475 14.05L16.725 19.375L12.05 16.55L7.375 19.375Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
