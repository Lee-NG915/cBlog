import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type ArrowForwardProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export function ArrowForward(props: ArrowForwardProps) {
  return (
    <Icons {...props}>
      <path d="M12.225 19.45l-.725-.7 6.025-6.025H5v-1h12.525L11.5 5.7l.725-.7 7.225 7.225-7.225 7.225z" />
    </Icons>
  );
}
