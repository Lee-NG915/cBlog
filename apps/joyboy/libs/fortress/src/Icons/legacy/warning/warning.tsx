import Icons, { IconsProps } from '../../Icons';

export type WarningProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export function Warning(props: WarningProps) {
  return (
    <Icons {...props}>
      <path d="M2.725 20L12 4l9.275 16H2.725zm1.725-1h15.1L12 6 4.45 19zM12 17.625a.602.602 0 0 0 .438-.187.602.602 0 0 0 .187-.438.602.602 0 0 0-.187-.438.602.602 0 0 0-.438-.187.602.602 0 0 0-.438.187.602.602 0 0 0-.187.438c0 .167.062.313.187.438a.602.602 0 0 0 .438.187zm-.5-2.25h1v-5h-1v5z" />
    </Icons>
  );
}
