import Icons, { IconsProps } from '../../Icons';

export type SellProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

export function Sell(props: SellProps) {
  return (
    <Icons {...props}>
      <path d="M13.556 20.7c-.184.2-.417.3-.7.3a.988.988 0 0 1-.725-.3l-8.8-8.8a1.17 1.17 0 0 1-.237-.338.955.955 0 0 1-.088-.412V4c0-.267.1-.5.3-.7.2-.2.433-.3.7-.3h7.15a1 1 0 0 1 .725.3l8.8 8.8c.2.2.304.446.313.737a.887.887 0 0 1-.288.713l-7.15 7.15Zm-.725-.7 7.175-7.15L11.156 4h-7.15v7.15L12.83 20ZM6.506 7.5a.97.97 0 0 0 .713-.287.97.97 0 0 0 .287-.713.97.97 0 0 0-.287-.713.97.97 0 0 0-.713-.287.97.97 0 0 0-.713.287.97.97 0 0 0-.287.713.97.97 0 0 0 .287.713.97.97 0 0 0 .713.287Z" />
    </Icons>
  );
}
