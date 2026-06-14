import Icons, { IconsProps } from '../../Icons';

export type IndeterminateCheckboxFilledProps = IconsProps;

export function IndeterminateCheckboxFilled(props: IndeterminateCheckboxFilledProps) {
  return (
    <Icons {...props}>
      <path d="M7.5 12.5H16.5V11.5H7.5V12.5ZM5.625 20C5.15833 20 4.771 19.846 4.463 19.538C4.15433 19.2293 4 18.8417 4 18.375V5.625C4 5.15833 4.15433 4.771 4.463 4.463C4.771 4.15433 5.15833 4 5.625 4H18.375C18.8417 4 19.2293 4.15433 19.538 4.463C19.846 4.771 20 5.15833 20 5.625V18.375C20 18.8417 19.846 19.2293 19.538 19.538C19.2293 19.846 18.8417 20 18.375 20H5.625Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
