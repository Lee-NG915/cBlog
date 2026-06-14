import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type ArrowForwardIosProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export function ArrowForwardIos(props: ArrowForwardIosProps) {
  return (
    <Icons {...props}>
      <path d="M8.05 21.1 7 20.05l8.225-8.25L7 3.55 8.05 2.5l9.325 9.3-9.325 9.3Z" />
    </Icons>
  );
}
