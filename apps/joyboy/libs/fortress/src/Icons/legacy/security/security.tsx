import Icons, { SvgIconProps as IconsProps } from '@mui/joy/SvgIcon';

export type SecurityProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/
// https://jakearchibald.github.io/svgomg/

export function Security(props: SecurityProps) {
  return (
    <Icons {...props}>
      <path
        d="M12.4707 21.1211C10.454 20.5378 8.78304 19.3251 7.4577 17.4831C6.13304 15.6418 5.4707 13.5711 5.4707 11.2711V5.87109L12.4707 3.24609L19.4707 5.87109V11.2711C19.4707 13.5711 18.808 15.6418 17.4827 17.4831C16.158 19.3251 14.4874 20.5378 12.4707 21.1211ZM12.4707 20.0711C14.0874 19.5711 15.4374 18.5838 16.5207 17.1091C17.604 15.6338 18.2374 13.9878 18.4207 12.1711H12.4707V4.32109L6.4707 6.54609V11.6961C6.4707 11.8294 6.48737 11.9878 6.5207 12.1711H12.4707V20.0711Z"
        fill="black"
      />
    </Icons>
  );
}
