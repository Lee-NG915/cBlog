import Icons, { IconsProps } from '../Icons';

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipPath="evenodd"
          d="M4.38238 15.4236L12.0914 22.5794L11.2977 23.4345L2.03906 14.8403L11.2977 6.24609L12.0914 7.10116L4.38238 14.257H26.2298V15.4236H4.38238Z"
          fill={props?.fill}
        />
      </svg>
    </Icons>
  );
}
