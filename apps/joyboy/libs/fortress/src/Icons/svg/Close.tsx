import { forwardRef } from 'react';
import Icons, { SvgIconProps } from '../Icons';

// https://www.zhangxinxu.com/sp/svgo/

const Close = forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => {
  return (
    <Icons ref={ref} {...props}>
      <path d="M11.232 12.002l-7.084 7.132a.509.509 0 0 0 .356.866.502.502 0 0 0 .356-.148l7.138-7.186 7.137 7.186a.5.5 0 0 0 .822-.165.51.51 0 0 0-.11-.553l-7.084-7.132 7.09-7.136A.509.509 0 0 0 19.495 4a.502.502 0 0 0-.356.148l-7.142 7.19-7.143-7.19a.502.502 0 0 0-.85.362.51.51 0 0 0 .138.356l7.09 7.136z" />
    </Icons>
  );
});

Close.displayName = 'Close';

export default Close;
