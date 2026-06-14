import { Button } from '@castlery/fortress';

const PrevArrow = ({ currentSlide, slideCount, ...props }) => (
    <Button {...props}>
      <svg id="line-left-arrow" viewBox="0 0 27 22">
        <path
          strokeWidth="1"
          d="M26 11H0m0 0l10.62 10M0 11L10.62 1"
          fill="#666"
          stroke="#c1af86"
          fillRule="evenodd"
          strokeDasharray="0,0"
          strokeLinecap="round"
        />
      </svg>
    </Button>
  );

  const NextArrow = ({ currentSlide, slideCount, ...props }) => (
    <Button {...props}>
      <svg id="line-right-arrow" viewBox="0 0 27 22">
        <path
          strokeWidth="1"
          d="M0 11h26m0 0L15.38 1M26 11L15.38 21"
          fill="#666"
					stroke="#c1af86"
          fillRule="evenodd"
          strokeDasharray="0,0"
          strokeLinecap="round"
        />
      </svg>
    </Button>
  );

  export { PrevArrow, NextArrow };
