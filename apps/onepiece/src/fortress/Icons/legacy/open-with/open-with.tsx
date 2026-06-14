import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type OpenWithProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

export function OpenWith(props: OpenWithProps) {
  return (
    <Icons {...props}>
      <path d="m11.8 21.1-3.55-3.55.7-.725 2.35 2.35V14.3h1v4.875l2.35-2.35.7.725-3.55 3.55Zm-5.75-5.75L2.5 11.8l3.55-3.55.7.7-2.325 2.35H9.3v1H4.425l2.35 2.35-.725.7Zm11.5 0-.725-.7 2.35-2.35H14.3v-1h4.875l-2.35-2.35.725-.7 3.55 3.55-3.55 3.55ZM11.3 9.3V4.425L8.95 6.75l-.7-.7L11.8 2.5l3.55 3.55-.7.725-2.35-2.35V9.3h-1Z" />
    </Icons>
  );
}
