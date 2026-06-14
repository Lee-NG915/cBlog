import Icons, { IconsProps } from '../../Icons';

export type CheckProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export function Check(props: CheckProps) {
  return (
    <Icons {...props}>
      <path d="M9.475 17.075L4.5 12.125l.725-.725 4.25 4.25 9.15-9.15.725.725-9.875 9.85z" />
    </Icons>
  );
}
