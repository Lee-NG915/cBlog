import Icons, { IconsProps } from '../Icons';

export default function (props: IconsProps) {
  return (
    <Icons {...props} viewBox="0 0 24 25">
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M3.5 17.775V16.775H20.5V17.775H3.5ZM3.5 13V12H20.5V13H3.5ZM3.5 8.22498V7.22498H20.5V8.22498H3.5Z"
        fill={props?.fill || '#212121'}
      />
    </Icons>
  );
}
