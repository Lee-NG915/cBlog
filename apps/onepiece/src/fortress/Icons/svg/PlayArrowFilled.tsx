import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

// https://www.zhangxinxu.com/sp/svgo/

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <path d="M8 19V5L19 12L8 19Z" />
    </Icons>
  );
}
