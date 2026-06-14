import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Icons, { IconsProps } from '../Icons';

// https://www.zhangxinxu.com/sp/svgo/

export default function (props: IconsProps) {
  return (
    <Icons viewBox="0 0 477.175 477.175" {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M9 20v-2H4.625c-.45 0-.833-.158-1.15-.475A1.566 1.566 0 0 1 3 16.375V5.625c0-.45.158-.833.475-1.15.317-.317.7-.475 1.15-.475h14.75c.45 0 .833.158 1.15.475.317.317.475.7.475 1.15V8.5h-1V5.625a.609.609 0 0 0-.175-.45.61.61 0 0 0-.45-.175H4.625a.61.61 0 0 0-.45.175.61.61 0 0 0-.175.45v10.75a.61.61 0 0 0 .175.45.609.609 0 0 0 .45.175h14.75a.61.61 0 0 0 .45-.175.61.61 0 0 0 .175-.45v-4.25a.61.61 0 0 0-.175-.45.61.61 0 0 0-.45-.175H11.6l2.35 2.35-.7.7L9.7 11l3.55-3.55.7.7-2.35 2.35h7.775c.467 0 .854.154 1.163.462.308.309.462.696.462 1.163v4.25c0 .45-.158.833-.475 1.15-.317.317-.7.475-1.15.475H15v2H9z" />
      </svg>
    </Icons>
  );
}
