import Icons, { IconsProps } from '../../Icons';

export type MapProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

export function Map(props: MapProps) {
  return (
    <Icons {...props}>
      <path d="m15 19.925-6-2.1-3.95 1.525c-.267.1-.508.075-.725-.075-.217-.15-.325-.367-.325-.65V6.4c0-.183.042-.346.125-.488A.737.737 0 0 1 4.5 5.6L9 4.075l6 2.1 3.95-1.525c.267-.1.508-.083.725.05a.658.658 0 0 1 .325.6v12.375a.781.781 0 0 1-.163.488.956.956 0 0 1-.412.312L15 19.925Zm-.5-1.225V7l-5-1.75v11.7l5 1.75Zm1 0 3.5-1.15V5.7L15.5 7v11.7ZM5 18.3l3.5-1.35V5.25L5 6.45V18.3Z" />
    </Icons>
  );
}
