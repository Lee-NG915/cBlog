import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type StarHalfProps = IconsProps;

export function StarHalf(props: StarHalfProps) {
  return (
    <Icons {...props}>
      <path d="M12.05 15.375L15.2 17.3L14.375 13.7L17.15 11.3L13.5 10.975L12.05 7.575V15.375ZM7.375 19.375L8.625 14.05L4.5 10.5L9.925 10.025L12.05 5L14.175 10.025L19.6 10.5L15.475 14.05L16.725 19.375L12.05 16.55L7.375 19.375Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
