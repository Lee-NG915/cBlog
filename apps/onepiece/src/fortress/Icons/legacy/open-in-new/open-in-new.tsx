import React from 'react';
import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type OpenInNewProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

export function OpenInNew(props: OpenInNewProps) {
  return (
    <Icons {...props}>
      <path d="M5.625 20c-.467 0-.854-.154-1.162-.462-.309-.309-.463-.696-.463-1.163V5.625c0-.467.154-.854.463-1.162C4.771 4.154 5.158 4 5.625 4h5.6v1h-5.6a.597.597 0 0 0-.437.188.597.597 0 0 0-.188.437v12.75c0 .167.063.312.188.437s.27.188.437.188h12.75a.597.597 0 0 0 .437-.188.597.597 0 0 0 .188-.437v-5.6h1v5.6c0 .467-.154.854-.462 1.163-.309.308-.696.462-1.163.462H5.625Zm4.125-5.025-.725-.725L18.3 5H14V4h6v6h-1V5.7l-9.25 9.275Z" />
    </Icons>
  );
}
