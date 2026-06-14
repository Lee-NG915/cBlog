'use client';
import { useMemo } from 'react';
import { Box } from '@castlery/fortress';

export interface RatingProps {
  size?: number;
  margin?: number;
  rating?: number;
  outerType?: 'fill' | 'outline';
  outerColor?: string; //十六进制颜色
  innerType?: 'fill' | 'outline';
  innerColor?: string;
}

export function Rating({
  size = 14,
  margin = 0,
  rating = 0,
  outerType = 'fill',
  outerColor = '#844025',
  innerType = 'fill',
  innerColor = '#9E9E9E',
}: RatingProps) {
  const { outerStar, innerStar } = useMemo(() => {
    let outerStar;
    let innerStar;

    if (outerType === 'fill') {
      outerStar = (
        <svg
          id="star"
          viewBox="0 0 20 20"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            margin: `0 ${margin}px`,
            // fill: outerColor,
          }}
        >
          <path
            d="M5.09763 17.5L6.40834 11.9435L2.08301 8.23913L7.77147 7.74348L9.99967 2.5L12.2279 7.74348L17.9163 8.23913L13.591 11.9435L14.9017 17.5L9.99967 14.5522L5.09763 17.5Z"
            fill={innerColor}
          />
        </svg>
      );
    } else {
      outerStar = (
        <svg
          id="star-outline"
          viewBox="0 0 20 20"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            margin: `0 ${margin}px`,
            fill: outerColor,
          }}
        >
          <path
            xmlns="http://www.w3.org/2000/svg"
            d="M11.9404 7.86523L12.0137 8.03809L12.2012 8.05469L17.1475 8.48535L13.3877 11.7061L13.2432 11.8301L13.2871 12.0156L14.4268 16.8496L10.1611 14.2842L10 14.1875L9.83887 14.2842L5.57129 16.8496L6.71289 12.0156L6.75586 11.8301L6.61133 11.7061L2.85059 8.48535L7.79883 8.05469L7.98535 8.03809L8.05957 7.86523L9.99902 3.29883L11.9404 7.86523Z"
            stroke={outerColor}
            strokeWidth="0.625"
          />
        </svg>
      );
    }

    if (innerType === 'fill') {
      innerStar = (
        <svg
          id="star"
          viewBox="0 0 20 20"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            margin: `0 ${margin}px`,
            // fill: outerColor,
          }}
        >
          <path
            d="M5.09763 17.5L6.40834 11.9435L2.08301 8.23913L7.77147 7.74348L9.99967 2.5L12.2279 7.74348L17.9163 8.23913L13.591 11.9435L14.9017 17.5L9.99967 14.5522L5.09763 17.5Z"
            fill={outerColor}
          />
        </svg>
      );
    } else {
      innerStar = (
        <svg
          id="star-outline"
          viewBox="0 0 20 20"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            margin: `0 ${margin}px`,
            fill: outerColor,
          }}
        >
          <path
            xmlns="http://www.w3.org/2000/svg"
            d="M11.9404 7.86523L12.0137 8.03809L12.2012 8.05469L17.1475 8.48535L13.3877 11.7061L13.2432 11.8301L13.2871 12.0156L14.4268 16.8496L10.1611 14.2842L10 14.1875L9.83887 14.2842L5.57129 16.8496L6.71289 12.0156L6.75586 11.8301L6.61133 11.7061L2.85059 8.48535L7.79883 8.05469L7.98535 8.03809L8.05957 7.86523L9.99902 3.29883L11.9404 7.86523Z"
            stroke={innerColor}
            strokeWidth="0.625"
          />
        </svg>
      );
    }
    return { outerStar, innerStar };
  }, [size, margin, outerType, outerColor, innerType, innerColor]);
  const ratio = (rating * size + (2 * Math.floor(rating) + 1) * margin) / (5 * size + 10 * margin);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-block',
        width: 'fit-content',
        lineHeight: 0,
        whiteSpace: 'nowrap',
        minWidth: '100px',
        svg: {
          display: 'inline-block',
          verticalAlign: 'top',
          fill: innerColor,
          '& + svg': {
            ml: '1px',
          },
        },
        '& > div': {
          lineHeight: 0,
          position: 'absolute',
          left: 0,
          top: 0,
          overflow: 'hidden',
          height: '100%',
          whiteSpace: 'nowrap',

          svg: {
            fill: (theme) => theme.palette.primary[500],
          },
        },
      }}
      style={{ marginLeft: `-${margin}px`, marginRight: `-${margin}px` }}
    >
      {innerStar}
      {innerStar}
      {innerStar}
      {innerStar}
      {innerStar}
      <Box style={{ width: `${(ratio > 1 ? 1 : ratio) * 100}%` }}>
        {outerStar}
        {outerStar}
        {outerStar}
        {outerStar}
        {outerStar}
      </Box>
    </Box>
  );
}
