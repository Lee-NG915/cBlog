import Icons, { IconsProps } from '../../Icons';

export type LeftFacingProps = IconsProps;

export function LeftFacing(props: LeftFacingProps) {
  return (
    <Icons {...props}>
      <g fillRule="evenodd" strokeWidth=".85" fill="none">
        <path d="m1 1h9.333333v13.575758h-9.333333z" />
        <path d="m10.333333 1h9.333333v6.787879h-9.333333z" />
        <path d="m19.666667 1h9.333333v6.787879h-9.333333z" />
        <path d="m1 2.69697h28" />
      </g>
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
