import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

// https://www.zhangxinxu.com/sp/svgo/

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <path d="M7.2 15.025L6.5 14.325L11.8 9L17.1 14.325L16.4 15.025L11.8 10.425L7.2 15.025Z" />
    </Icons>
  );
}
