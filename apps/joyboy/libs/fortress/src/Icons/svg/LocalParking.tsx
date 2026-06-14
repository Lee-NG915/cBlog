import Icons, { IconsProps } from '../Icons';

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6.5 20V4H12.5C13.8667 4 15.0417 4.49167 16.025 5.475C17.0083 6.45833 17.5 7.63333 17.5 9C17.5 10.3667 17.0083 11.5417 16.025 12.525C15.0417 13.5083 13.8667 14 12.5 14H8.5V20H6.5ZM8.5 12H12.55C13.3667 12 14.071 11.7043 14.663 11.113C15.2543 10.521 15.55 9.81667 15.55 9C15.55 8.18333 15.2543 7.479 14.663 6.887C14.071 6.29567 13.3667 6 12.55 6H8.5V12Z"
          fill="#212121"
        />
      </svg>
    </Icons>
  );
}
