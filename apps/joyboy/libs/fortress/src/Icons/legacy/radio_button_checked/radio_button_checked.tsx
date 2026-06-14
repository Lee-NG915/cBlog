import Icons, { IconsProps } from '../../Icons';

export type RadioButtonCheckedProps = IconsProps;

export function RadioButtonChecked(props: RadioButtonCheckedProps) {
  return (
    <Icons {...props}>
      <path d="M11.5 18.5v-6h-6v-1h6v-6h1v6h6v1h-6v6h-1Z" />
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
