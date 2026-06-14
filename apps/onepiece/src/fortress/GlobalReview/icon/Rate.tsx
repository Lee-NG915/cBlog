import * as React from 'react';
import { IconProps } from './icon';

const Rate = ({ fill = '#A45B37', width = 17, height = 16, outerClass = '' }: IconProps) => {
  return (
    <svg
      className={outerClass}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <path
        d="M4.44277 14.0781L5.49133 9.61123L2.03107 6.63331L6.58184 6.23485L8.3644 2.01962L10.147 6.23485L14.6977 6.63331L11.2375 9.61123L12.286 14.0781L8.3644 11.7084L4.44277 14.0781Z"
        fill={fill}
        stroke={fill}
        strokeWidth="1"
      />
    </svg>
  );
};

export default Rate;
