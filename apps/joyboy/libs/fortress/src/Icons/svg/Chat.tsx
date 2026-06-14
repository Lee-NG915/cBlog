import Icons, { IconsProps } from '../Icons';

export type ChatProps = IconsProps;

// https://www.zhangxinxu.com/sp/svgo/

export default function (props: ChatProps) {
  return (
    <Icons {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 18">
        <g transform="translate(.116)" fill="none" fillRule="evenodd">
          <circle fill="none" stroke="#C1AF86" stroke-width="1.5" cx="5.884" cy="8" r="0.75" />
          <circle fill="none" stroke="#C1AF86" stroke-width="1.5" cx="10.384" cy="8" r="0.75" />
          <circle fill="none" stroke="#C1AF86" stroke-width="1.5" cx="14.884" cy="8" r="0.75" />
          <path d="M19.5.5v14.07h-7.353L10.3 17.145 8.438 14.57H.5V.5h19z" stroke="#C1AF86" />
        </g>
      </svg>
    </Icons>
  );
}
