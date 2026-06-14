import Icons, { IconsProps } from '../../Icons';

export type FilterAltProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export function FilterAlt(props: FilterAltProps) {
  return (
    <Icons {...props}>
      <path d="M11.775 19a.748.748 0 0 1-.55-.225.748.748 0 0 1-.225-.55V12.65L5.6 5.825c-.133-.183-.15-.367-.05-.55A.503.503 0 0 1 6.025 5h11.95c.217 0 .375.092.475.275.1.183.083.367-.05.55L13 12.65v5.575c0 .217-.075.4-.225.55a.748.748 0 0 1-.55.225h-.45ZM12 12.3 16.95 6h-9.9L12 12.3Z" />
    </Icons>
  );
}
