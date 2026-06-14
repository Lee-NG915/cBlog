import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type CheckboxFilledProps = IconsProps;

export function CheckboxFilled(props: CheckboxFilledProps) {
  return (
    <Icons {...props}>
      <path d="M10.6 15.5L17 9.1L16.3 8.4L10.6 14.1L7.75 11.25L7.05 11.95L10.6 15.5ZM5.625 20C5.15833 20 4.771 19.846 4.463 19.538C4.15433 19.2293 4 18.8417 4 18.375V5.625C4 5.15833 4.15433 4.771 4.463 4.463C4.771 4.15433 5.15833 4 5.625 4H18.375C18.8417 4 19.2293 4.15433 19.538 4.463C19.846 4.771 20 5.15833 20 5.625V18.375C20 18.8417 19.846 19.2293 19.538 19.538C19.2293 19.846 18.8417 20 18.375 20H5.625Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
