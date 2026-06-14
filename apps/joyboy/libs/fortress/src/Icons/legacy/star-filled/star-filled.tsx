import Icons, { IconsProps } from '../../Icons';

export type StarFilledProps = IconsProps;

export function StarFilled(props: StarFilledProps) {
  return (
    <Icons {...props}>
      <path d="M7.375 19.375L8.625 14.05L4.5 10.5L9.925 10.025L12.05 5L14.175 10.025L19.6 10.5L15.475 14.05L16.725 19.375L12.05 16.55L7.375 19.375Z" />
      {/* <path d="M5.91418 21.1172L7.48703 14.4169L2.29663 9.94997L9.12279 9.35229L11.7966 3.02944L14.4705 9.35229L21.2966 9.94997L16.1062 14.4169L17.6791 21.1172L11.7966 17.5626L5.91418 21.1172Z" /> */}
    </Icons>
  );
}

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/
