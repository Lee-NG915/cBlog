import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type BoltProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

export function Bolt(props: BoltProps) {
  return (
    <Icons {...props}>
      <path d="m10.23 20 .9-6.225H8.38c-.232 0-.37-.063-.411-.188-.042-.125-.005-.287.112-.487l4.8-9.1h.9l-.9 6.225h2.75c.2 0 .33.062.388.187.058.125.029.288-.088.488l-4.8 9.1h-.9Z" />
    </Icons>
  );
}
