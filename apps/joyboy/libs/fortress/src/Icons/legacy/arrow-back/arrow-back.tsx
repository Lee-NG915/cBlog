import Icons, { IconsProps } from '../../Icons';

export type ArrowBackProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export function ArrowBack(props: ArrowBackProps) {
  return (
    <Icons {...props}>
      <path d="M12.225 19.45L5 12.225 12.225 5l.725.7-6.025 6.025H19.45v1H6.925l6.025 6.025-.725.7z" />
    </Icons>
  );
}
