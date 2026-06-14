import Icons, { IconsProps } from '../../Icons';

export type EmojiFlagsProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

export function EmojiFlags(props: EmojiFlagsProps) {
  return (
    <Icons {...props}>
      <path d="M5.5 19.75V4.25h7.2l.4 2h5.4v8h-5.2l-.4-2H6.5v7.5h-1Zm8.65-6.5h3.35v-6h-5.25l-.4-2H6.5v6h7.25l.4 2Z" />
    </Icons>
  );
}
