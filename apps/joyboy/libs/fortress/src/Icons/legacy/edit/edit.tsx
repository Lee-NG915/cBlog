import Icons, { IconsProps } from '../../Icons';

export type EditProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

export function Edit(props: EditProps) {
  return (
    <Icons {...props}>
      <path d="M5 18.625h1.075l9.9-9.9L14.9 7.65 5 17.55v1.075ZM18.125 8l-2.5-2.475 1.2-1.2A.951.951 0 0 1 17.55 4c.283 0 .525.108.725.325l1.05 1.025c.2.2.3.442.3.725s-.1.525-.3.725l-1.2 1.2Zm-.725.725-10.9 10.9H4v-2.5l10.9-10.9 2.5 2.5Z" />
    </Icons>
  );
}
