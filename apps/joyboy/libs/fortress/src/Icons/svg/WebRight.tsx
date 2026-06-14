import Icons, { IconsProps } from '../Icons';

// https://www.zhangxinxu.com/sp/svgo/

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_dd_1397_61223)">
          <rect x="10" y="8" width="56" height="56" rx="28" fill="white" shapeRendering="crispEdges" />
          <path
            fillRule="evenodd"
            clipPath="evenodd"
            d="M41.7023 26.1774L52.3146 36L41.7023 45.8225L40.7966 44.844L49.6315 36.6666H24.6665V35.3333H49.6315L40.7966 27.1559L41.7023 26.1774Z"
            fill="#323433"
          />
        </g>
        <defs>
          <filter
            id="filter0_dd_1397_61223"
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
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.196078 0 0 0 0 0.203922 0 0 0 0 0.2 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1397_61223" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology radius="2" operator="erode" in="SourceAlpha" result="effect2_dropShadow_1397_61223" />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="6" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.196078 0 0 0 0 0.203922 0 0 0 0 0.2 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="effect1_dropShadow_1397_61223" result="effect2_dropShadow_1397_61223" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_1397_61223" result="shape" />
          </filter>
        </defs>
      </svg>
    </Icons>
  );
}
