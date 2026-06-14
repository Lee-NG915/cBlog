import React from 'react';
import SvgIcon, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type ArrowRightProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

/**
 * ![img](https://s2.loli.net/2023/03/23/ibclKfAeBnFSoW8.png)
 */
export function ArrowRight(props: ArrowRightProps) {
  return (
    <SvgIcon {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.7769 4.63306L22.7361 12L14.7769 19.3669L14.0976 18.6331L20.7237 12.5H2V11.5H20.7237L14.0976 5.36694L14.7769 4.63306Z"
      />
    </SvgIcon>
  );
}
