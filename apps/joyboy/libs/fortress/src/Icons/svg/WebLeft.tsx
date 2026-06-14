import Icons, { IconsProps } from '../Icons';

// https://www.zhangxinxu.com/sp/svgo/

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_dd_1397_61221)">
          <rect x="10" y="9" width="56" height="56" rx="28" fill="white" />
          <path
            fillRule="evenodd"
            clipPath="evenodd"
            d="M26.3648 37.6667L35.1752 45.8448L34.2681 46.822L23.6868 37L34.2681 27.1781L35.1752 28.1553L26.3648 36.3334H51.3334V37.6667H26.3648Z"
            fill="#323433"
          />
        </g>
        <defs>
          <filter
            id="filter0_dd_1397_61221"
            x="0"
            y="0"
            width="76"
            height="76"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="0.5" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.196078 0 0 0 0 0.203922 0 0 0 0 0.2 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1397_61221" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology radius="2" operator="erode" in="SourceAlpha" result="effect2_dropShadow_1397_61221" />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="6" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.196078 0 0 0 0 0.203922 0 0 0 0 0.2 0 0 0 0.5 0" />
            <feBlend mode="normal" in2="effect1_dropShadow_1397_61221" result="effect2_dropShadow_1397_61221" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_1397_61221" result="shape" />
          </filter>
        </defs>
      </svg>
    </Icons>
  );
}
