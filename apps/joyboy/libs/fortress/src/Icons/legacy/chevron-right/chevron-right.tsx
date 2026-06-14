import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type ChevronRightProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export function ChevronRight(props: ChevronRightProps) {
  return (
    <Icons viewBox="0 0 20 21" {...props}>
        <path d="M7.44428 16.6027L6.6665 15.8323L11.7776 10.7694L6.6665 5.70648L7.44428 4.93604L13.3332 10.7694L7.44428 16.6027Z"/>
    </Icons>
  );
}
