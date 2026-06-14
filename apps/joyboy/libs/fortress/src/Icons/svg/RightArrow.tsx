import Icons, { IconsProps } from '../Icons';

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.8028 6.24414L27.0886 14.8389L17.8028 23.4337L17.0103 22.5775L24.7408 15.4222H2.89648V14.2556H24.7408L17.0103 7.10034L17.8028 6.24414Z"
          fill={props?.fill}
        />
      </svg>
    </Icons>
  );
}
