import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

// https://www.zhangxinxu.com/sp/svgo/

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <path d="M11.8 15.025L6.5 9.725L7.2 9L11.8 13.6L16.4 9L17.1 9.725L11.8 15.025Z" />
    </Icons>
  );
}
