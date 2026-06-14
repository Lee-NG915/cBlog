import Icons, { IconsProps } from '../Icons';

// https://www.zhangxinxu.com/sp/svgo/

export default function (props: IconsProps) {
  return (
    <Icons {...props}>
      <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_dd_1397_61248)">
          <rect x="10" y="8" width="56" height="56" rx="28" fill="white" shapeRendering="crispEdges" />
          <path
            d="M36.9763 36.0033L27.5303 45.5123C27.4043 45.639 27.3335 45.811 27.3335 45.9903C27.3335 46.1696 27.4042 46.3416 27.5301 46.4684C27.6561 46.5952 27.8269 46.6665 28.005 46.6665C28.1831 46.6666 28.354 46.5954 28.48 46.4686L37.997 36.8881L47.514 46.4686C47.6454 46.6009 47.8171 46.6666 47.9889 46.6666C48.1217 46.6667 48.2517 46.6271 48.3621 46.5528C48.4726 46.4785 48.5588 46.3728 48.6096 46.2492C48.6604 46.1256 48.6737 45.9897 48.6477 45.8585C48.6218 45.7273 48.5577 45.6068 48.4637 45.5123L39.018 36.0033L48.47 26.4876C48.596 26.3608 48.6668 26.1889 48.6668 26.0095C48.6669 25.8302 48.5961 25.6582 48.4702 25.5314C48.3443 25.4046 48.1734 25.3333 47.9953 25.3333C47.8172 25.3333 47.6463 25.4045 47.5204 25.5313L37.9973 35.1184L28.4733 25.5316C28.3461 25.4107 28.1772 25.3445 28.0023 25.347C27.8274 25.3495 27.6604 25.4206 27.5367 25.5451C27.4131 25.6696 27.3425 25.8378 27.3401 26.0138C27.3376 26.1899 27.4035 26.36 27.5236 26.4879L36.9763 36.0033Z"
            fill="#323433"
          />
        </g>
        <defs>
          <filter
            id="filter0_dd_1397_61248"
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
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1397_61248" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology radius="2" operator="erode" in="SourceAlpha" result="effect2_dropShadow_1397_61248" />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="6" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.196078 0 0 0 0 0.203922 0 0 0 0 0.2 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="effect1_dropShadow_1397_61248" result="effect2_dropShadow_1397_61248" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_1397_61248" result="shape" />
          </filter>
        </defs>
      </svg>
    </Icons>
  );
}
