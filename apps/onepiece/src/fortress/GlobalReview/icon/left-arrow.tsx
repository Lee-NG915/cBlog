import * as React from 'react';
import { IconProps } from './icon';

const LeftArrow = ({ fill = '', width = 28, height = 28, outerClass = '' }: IconProps) => {
  return (
    <svg
      className={outerClass}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      style={{
        transform: `rotate(180deg)`,
      }}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M17.2398 5.40527L26.5256 14L17.2398 22.5948L16.4474 21.7386L24.1778 14.5834H2.3335V13.4167H24.1778L16.4474 6.26147L17.2398 5.40527Z"
        fill={fill}
      />
    </svg>
  );
};

export default LeftArrow;
