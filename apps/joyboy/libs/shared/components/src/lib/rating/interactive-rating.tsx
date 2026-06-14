'use client';
import { useMemo, useState, useCallback } from 'react';
import { Box } from '@castlery/fortress';

export interface InteractiveRatingProps {
  size?: number;
  margin?: number;
  rating?: number;
  outerType?: 'fill' | 'outline';
  outerColor?: string; //十六进制颜色
  innerType?: 'fill' | 'outline';
  innerColor?: string;
  disabled?: boolean;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
}

export function InteractiveRating({
  size = 14,
  margin = 0,
  rating = 0,
  outerType = 'fill',
  outerColor = '#A45B37',
  innerType = 'fill',
  innerColor = '#CCC',
  disabled = false,
  onRatingChange,
  maxRating = 5,
}: InteractiveRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // 当前显示的评分：
  // - 悬浮时：显示悬浮评分（预展示状态）
  // - 非悬浮时：显示实际评分
  const displayRating = isHovering ? hoverRating || 0 : rating;

  const { backgroundStar, foregroundStar } = useMemo(() => {
    // 背景星星（始终为空态）
    const backgroundStar = (
      <svg
        id="star-outline"
        viewBox="0 0 20 20"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          margin: `0 ${margin}px`,
        }}
      >
        <path
          xmlns="http://www.w3.org/2000/svg"
          d="M11.9404 7.86523L12.0137 8.03809L12.2012 8.05469L17.1475 8.48535L13.3877 11.7061L13.2432 11.8301L13.2871 12.0156L14.4268 16.8496L10.1611 14.2842L10 14.1875L9.83887 14.2842L5.57129 16.8496L6.71289 12.0156L6.75586 11.8301L6.61133 11.7061L2.85059 8.48535L7.79883 8.05469L7.98535 8.03809L8.05957 7.86523L9.99902 3.29883L11.9404 7.86523Z"
          stroke={innerColor}
          strokeWidth="0.625"
          fill="transparent"
        />
      </svg>
    );

    // 前景星星（根据 innerType 显示填充状态）
    const foregroundStar =
      innerType === 'fill' ? (
        <svg
          id="star"
          viewBox="0 0 20 20"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            margin: `0 ${margin}px`,
          }}
        >
          <path
            d="M5.09763 17.5L6.40834 11.9435L2.08301 8.23913L7.77147 7.74348L9.99967 2.5L12.2279 7.74348L17.9163 8.23913L13.591 11.9435L14.9017 17.5L9.99967 14.5522L5.09763 17.5Z"
            fill={outerColor}
          />
        </svg>
      ) : (
        <svg
          id="star-outline"
          viewBox="0 0 20 20"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            margin: `0 ${margin}px`,
          }}
        >
          <path
            xmlns="http://www.w3.org/2000/svg"
            d="M11.9404 7.86523L12.0137 8.03809L12.2012 8.05469L17.1475 8.48535L13.3877 11.7061L13.2432 11.8301L13.2871 12.0156L14.4268 16.8496L10.1611 14.2842L10 14.1875L9.83887 14.2842L5.57129 16.8496L6.71289 12.0156L6.75586 11.8301L6.61133 11.7061L2.85059 8.48535L7.79883 8.05469L7.98535 8.03809L8.05957 7.86523L9.99902 3.29883L11.9404 7.86523Z"
            stroke={outerColor}
            strokeWidth="0.625"
            fill="transparent"
          />
        </svg>
      );

    return { backgroundStar, foregroundStar };
  }, [size, margin, outerColor, innerType, innerColor]);

  // 计算显示比例 - 简化公式，当 margin = 0 时，ratio = displayRating / maxRating
  const ratio =
    margin === 0
      ? displayRating / maxRating
      : (displayRating * size + (2 * Math.floor(displayRating) + 1) * margin) /
        (maxRating * size + 2 * maxRating * margin);

  // 处理鼠标进入事件
  const handleMouseEnter = useCallback(
    (starIndex: number) => {
      if (disabled) return;
      const newHoverRating = starIndex + 1;
      setHoverRating(newHoverRating);
      setIsHovering(true);
    },
    [disabled]
  );

  // 处理鼠标离开事件
  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    setIsHovering(false);
    setHoverRating(null);
  }, [disabled]);

  // 处理点击事件
  const handleClick = useCallback(
    (starIndex: number) => {
      if (disabled) return;
      const newRating = starIndex + 1;
      onRatingChange?.(newRating);
    },
    [disabled, onRatingChange]
  );

  // 生成星星数组
  const stars = useMemo(() => {
    return Array.from({ length: maxRating }, (_, index) => (
      <Box
        key={index}
        component="span"
        sx={{
          display: 'inline-block',
          cursor: disabled ? 'default' : 'pointer',
          position: 'relative',
          '&:hover': {
            transform: disabled ? 'none' : 'scale(1.1)',
            transition: 'transform 0.1s ease-in-out',
          },
        }}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(index)}
      >
        {backgroundStar}
      </Box>
    ));
  }, [maxRating, backgroundStar, disabled, handleMouseEnter, handleMouseLeave, handleClick]);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-block',
        lineHeight: 0,
        userSelect: 'none',
        svg: {
          fill: '#CCC',
          '& + svg': {
            ml: '1px',
          },
        },
        div: {
          lineHeight: 0,
          position: 'absolute',
          left: 0,
          top: 0,
          overflow: 'hidden',
          height: '100%',
          whiteSpace: 'nowrap',
          pointerEvents: 'none', // 防止遮罩层阻止交互

          svg: {
            fill: (theme) => theme.palette.primary[500],
          },
        },
      }}
      style={{ marginLeft: `-${margin}px`, marginRight: `-${margin}px` }}
    >
      {/* 背景星星 */}
      {stars}

      {/* 前景星星（根据评分显示） */}
      <Box style={{ width: `${(ratio > 1 ? 1 : ratio) * 100}%` }}>
        {Array.from({ length: maxRating }, (_, index) => (
          <Box
            key={index}
            component="span"
            sx={{
              display: 'inline-block',
              pointerEvents: 'none',
            }}
          >
            {foregroundStar}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
