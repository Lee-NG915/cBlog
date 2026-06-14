import React from 'react';
import SvgIcon, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type ArrowLeftProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

/**
 * ![img](https://s2.loli.net/2023/03/23/ibclKfAeBnFSoW8.png)
 */
export function ArrowLeft(props: ArrowLeftProps) {
  return (
    <SvgIcon id="leftArrow" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.27357 12.5L9.88131 18.6335L9.20099 19.3665L1.26501 12L9.20099 4.63354L9.88131 5.36646L3.27357 11.5H22V12.5H3.27357Z"
      />
    </SvgIcon>
  );
}
