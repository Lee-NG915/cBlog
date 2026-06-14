import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type MailProps = IconsProps;

export function Mail(props: MailProps) {
  return (
    <Icons {...props}>
      <path d="M4.625 19c-.467 0-.854-.154-1.162-.462-.309-.309-.463-.696-.463-1.163V6.625c0-.467.154-.854.463-1.162C3.771 5.154 4.158 5 4.625 5h14.75c.467 0 .854.154 1.163.463.308.308.462.695.462 1.162v10.75c0 .467-.154.854-.462 1.163-.309.308-.696.462-1.163.462H4.625ZM12 12.125l-8-5.25v10.5a.61.61 0 0 0 .175.45.609.609 0 0 0 .45.175h14.75a.61.61 0 0 0 .45-.175.61.61 0 0 0 .175-.45v-10.5l-8 5.25ZM12 11l7.7-5H4.3l7.7 5ZM4 6.875V6v11.375a.61.61 0 0 0 .175.45.609.609 0 0 0 .45.175H4V6.875Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
