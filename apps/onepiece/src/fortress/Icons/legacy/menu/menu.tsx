import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type MenuProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export function Menu(props: MenuProps) {
  return (
    <Icons {...props}>
      <path d="M3.5 15.775V14.775H20.5V15.775H3.5ZM3.5 9.22498V8.22498H20.5V9.22498H3.5Z" />
    </Icons>
  );
}
