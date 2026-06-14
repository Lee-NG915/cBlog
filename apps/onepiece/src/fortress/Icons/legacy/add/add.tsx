import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type AddProps = IconsProps;

export function Add(props: AddProps) {
  return (
    <Icons {...props}>
      <path d="M11.5 18.5V12.5H5.5V11.5H11.5V5.5H12.5V11.5H18.5V12.5H12.5V18.5H11.5Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
