import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type ArrowBackIosNewProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export function ArrowBackIosNew(props: ArrowBackIosNewProps) {
  return (
    <Icons {...props}>
      <path d="M16.3 21.1L7 11.8l9.3-9.3 1.075 1.05-8.25 8.25 8.25 8.25L16.3 21.1z" />
    </Icons>
  );
}
