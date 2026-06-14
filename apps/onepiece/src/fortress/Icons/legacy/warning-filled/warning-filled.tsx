import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type WarningFilledProps = IconsProps;

export function WarningFilled(props: WarningFilledProps) {
  return (
    <Icons {...props}>
      <path d="M2.72498 20L12 4L21.275 20H2.72498ZM12 17.625C12.1666 17.625 12.3126 17.5627 12.438 17.438C12.5626 17.3127 12.625 17.1667 12.625 17C12.625 16.8333 12.5626 16.6873 12.438 16.562C12.3126 16.4373 12.1666 16.375 12 16.375C11.8333 16.375 11.6873 16.4373 11.562 16.562C11.4373 16.6873 11.375 16.8333 11.375 17C11.375 17.1667 11.4373 17.3127 11.562 17.438C11.6873 17.5627 11.8333 17.625 12 17.625ZM11.5 15.375H12.5V10.375H11.5V15.375Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
