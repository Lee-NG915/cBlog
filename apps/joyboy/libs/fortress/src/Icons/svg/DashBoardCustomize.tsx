import Icons, { SvgIconProps } from '../Icons';

export default function (props: SvgIconProps) {
  return (
    <Icons {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3.5 3.5H10.5V10.5H3.5V3.5ZM13.5 3.5H20.5V10.5H13.5V3.5ZM3.5 13.5H10.5V20.5H3.5V13.5ZM16.5 13.5H17.5V16.5H20.5V17.5H17.5V20.5H16.5V17.5H13.5V16.5H16.5V13.5ZM14.5 4.5V9.5H19.5V4.5H14.5ZM4.5 4.5V9.5H9.5V4.5H4.5ZM4.5 14.5V19.5H9.5V14.5H4.5Z"
          fill="#212121"
        />
      </svg>
    </Icons>
  );
}
