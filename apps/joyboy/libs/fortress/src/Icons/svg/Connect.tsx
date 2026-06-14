// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Icons, { IconsProps } from '../Icons';

// https://www.zhangxinxu.com/sp/svgo/

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M8.56348 19.5141L7.86348 18.8141L10.9385 15.7141H3.06348V14.7141H10.9385L7.86348 11.6141L8.56348 10.9141L12.8635 15.2141L8.56348 19.5141ZM16.5635 13.5141L12.2635 9.21406L16.5635 4.91406L17.2635 5.61406L14.1885 8.71406H22.0635V9.71406H14.1885L17.2635 12.8141L16.5635 13.5141Z" />
      </svg>
    </Icons>
  );
}
