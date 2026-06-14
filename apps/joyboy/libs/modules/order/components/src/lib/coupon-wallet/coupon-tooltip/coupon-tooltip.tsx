'use client';
import { Box, IconButton, Typography } from '@castlery/fortress';
import { Error } from '@castlery/fortress/Icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface CouponTooltipProps {
  title: string | string[];
  position?: 'top' | 'left';
}

export function CouponTooltip({ title, position = 'top' }: CouponTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 计算 tooltip 位置
  const calculatePosition = useCallback(
    (event: React.MouseEvent | React.FocusEvent) => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();

      if (position === 'left') {
        setCoords({
          left: rect.left - 10, // 向左偏移
          top: rect.top + rect.height / 2,
        });
      } else {
        // 默认顶部显示
        setCoords({
          left: rect.left + rect.width / 2,
          top: rect.top - 10, // 向上偏移
        });
      }
    },
    [position]
  );

  // 根据position计算tooltip的样式
  const getTooltipStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.8)',
      borderRadius: 1,
      p: 1.5,
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    };

    if (position === 'left') {
      return {
        ...baseStyles,
        right: 'auto',
        left: coords.left,
        top: coords.top,
        transform: 'translate(-100%,-50%)',
        // 左侧箭头
        '&::after': {
          content: '""',
          position: 'absolute',
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          border: '6px solid transparent',
          borderLeftColor: 'rgba(0,0,0,0.8)',
        },
      };
    }

    // 默认顶部显示
    return {
      ...baseStyles,
      left: coords.left,
      top: coords.top,
      transform: 'translate(-50%, -95%)',
      // 顶部箭头
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        border: '6px solid transparent',
        borderTopColor: 'rgba(0,0,0,0.8)',
      },
    };
  };

  // 处理鼠标进入
  const handleMouseEnter = useCallback(
    (event: React.MouseEvent) => {
      calculatePosition(event);
      setIsVisible(true);
    },
    [calculatePosition]
  );

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  // 处理点击事件
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      calculatePosition(event);
      setIsVisible((pre) => !pre);
    },
    [calculatePosition]
  );

  // 监听点击外部关闭 tooltip
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      setIsVisible(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isVisible]);

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-block', width: 20, height: 20 }}>
        <IconButton
          ref={triggerRef}
          sx={{
            flex: 'none',
            minWidth: 20,
            minHeight: 20,
            p: 0,
            m: 0,
            position: 'relative',
            '& svg': {
              width: 20,
              height: 20,
            },
          }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Error sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      {isVisible &&
        createPortal(
          <Box sx={getTooltipStyles()} onMouseEnter={() => setIsVisible(true)} onMouseLeave={handleMouseLeave}>
            {Array.isArray(title) ? (
              title.map((item, index) => (
                <Typography level="caption2" sx={{ color: 'white' }} key={index} noWrap>
                  {item}
                </Typography>
              ))
            ) : (
              <Typography level="caption2" sx={{ color: 'white' }} noWrap>
                {title}
              </Typography>
            )}
          </Box>,
          document.body
        )}
    </>
  );
}

export default CouponTooltip;
