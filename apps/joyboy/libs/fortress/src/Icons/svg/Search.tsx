import Icons, { IconsProps } from '../Icons';

// https://www.zhangxinxu.com/sp/svgo/

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.333 3.303c-3.915 0-7.077 3.136-7.077 6.992 0 3.857 3.162 6.992 7.077 6.992 3.912 0 7.076-3.135 7.076-6.992 0-3.856-3.163-6.992-7.076-6.992zm-8.077 6.992c0-4.42 3.62-7.992 8.077-7.992 4.454 0 8.076 3.573 8.076 7.992a7.913 7.913 0 0 1-2.072 5.344l5.407 5.347-.703.71-5.421-5.36a8.096 8.096 0 0 1-5.287 1.951c-4.456 0-8.077-3.572-8.077-7.992z"
      />
    </Icons>
  );
}
