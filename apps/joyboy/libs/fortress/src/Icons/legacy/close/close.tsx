import Icons, { IconsProps } from '../../Icons';

export type CloseProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export function Close(props: CloseProps) {
  return (
    <Icons {...props}>
      <path d="M6.2 18.1L5.5 17.4L11.1 11.8L5.5 6.2L6.2 5.5L11.8 11.1L17.4 5.5L18.1 6.2L12.5 11.8L18.1 17.4L17.4 18.1L11.8 12.5L6.2 18.1Z" />
    </Icons>
  );
}
