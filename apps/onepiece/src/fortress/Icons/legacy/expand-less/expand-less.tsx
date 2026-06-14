import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type ExpandLessProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export function ExpandLess(props: ExpandLessProps) {
  return (
    <Icons {...props}>
      <path d="m7.2 15.025-.7-.7L11.8 9l5.3 5.325-.7.7-4.6-4.6-4.6 4.6Z" />
    </Icons>
  );
}
