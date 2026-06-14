import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type PlusProps = IconsProps;

export function Plus(props: PlusProps) {
  return (
    <Icons {...props}>
      <path d="M11.517 11.52H2.632a.447.447 0 1 0 0 .893h8.952v8.952a.445.445 0 0 0 .36.439.446.446 0 0 0 .533-.439V12.48h8.891a.447.447 0 1 0 0-.894h-8.957V2.63a.447.447 0 0 0-.894 0v8.891Z" />
    </Icons>
  );
}
// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
