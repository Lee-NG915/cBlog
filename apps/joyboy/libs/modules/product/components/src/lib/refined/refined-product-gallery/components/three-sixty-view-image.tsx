'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Stack, Typography, useTheme, useBreakpoints } from '@castlery/fortress';
import { useSpring, animated, config } from 'react-spring';
import { useDrag } from '@use-gesture/react';
import { FortressImage } from '@castlery/shared-components';
import { ThreedImage, Variant } from '@castlery/modules-product-domain';
import { ThreeSixty } from '@castlery/fortress/Icons';

interface ThreeSixtyViewImageProps {
  variant: Variant;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  position?: number;
  className?: string;
}

const ThreeSixtyViewImage: React.FC<ThreeSixtyViewImageProps> = ({
  variant = {} as Variant,
  onPointerDown,
  onPointerUp,
  position = -1,
  className,
  ...rest
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<Array<ThreedImage>>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  // Refs
  const isMountedRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { desktop } = useBreakpoints();

  const DISTANCE = desktop ? 40 : 25;

  const [springProps, springApi] = useSpring(() => ({
    scale: 1,
    opacity: 1,
    config: config.gentle,
  }));

  const bind = useDrag(
    ({ movement: [mx], velocity: [vx], down, first, last, cancel }) => {
      if (loading || images.length === 0) {
        cancel();
        return;
      }

      if (first) {
        setIsDragging(true);
        onPointerDown?.();

        springApi.start({
          scale: 0.98,
          config: config.stiff,
        });
      }

      if (down) {
        // 计算目标索引
        const steps = Math.floor(Math.abs(mx) / DISTANCE);
        if (steps > 0) {
          const direction = mx < 0 ? 1 : -1;
          const newIndex = (currentIndex + direction * steps + images.length) % images.length;
          setCurrentIndex(newIndex);
        }
      }

      if (last) {
        setIsDragging(false);
        onPointerUp?.();

        // 优化惯性效果
        if (Math.abs(vx) > 0.3) {
          // 降低惯性触发阈值
          const inertiaSteps = Math.min(Math.floor(Math.abs(vx) * 1.2), 3);
          const direction = vx < 0 ? 1 : -1;

          setTimeout(() => {
            setCurrentIndex((prev) => (prev + direction * inertiaSteps + images.length) % images.length);
          }, 30); // 缩短延迟
        }

        springApi.start({
          scale: 1,
          config: config.wobbly,
        });
      }
    },
    {
      axis: 'x',
      threshold: 3,
      rubberband: true,
    }
  );

  // 图片加载完成回调
  const handleImageLoad = useCallback(
    (imageIndex: number) => {
      setLoadedImages((prev) => {
        const newSet = new Set([...prev, imageIndex]);

        // 检查是否所有图片都加载完成
        if (newSet.size >= images.length && isMountedRef.current) {
          setTimeout(() => {
            setLoading(false);
          }, 100);
        }

        return newSet;
      });
    },
    [images.length]
  );

  // 加载图片逻辑
  const initializeImages = useCallback(() => {
    const imageList = variant.threed_images || [];
    setImages(imageList);
    setCurrentIndex(0);
    setLoadedImages(new Set());
    setLoading(imageList.length > 0);

    if (imageList.length === 0) {
      setLoading(false);
    }
  }, [variant.threed_images]);

  // 生命周期
  useEffect(() => {
    isMountedRef.current = true;
    initializeImages();

    return () => {
      isMountedRef.current = false;
    };
  }, [initializeImages]);

  return (
    <Stack
      ref={containerRef}
      className={className}
      direction={'row'}
      alignItems={'center'}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: loading ? 'wait' : isDragging ? 'grabbing' : 'grab',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'pan-y pinch-zoom',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
      {...bind()}
      {...rest}
    >
      {/* 图片容器 */}
      <animated.div
        style={{
          ...springProps,
          position: 'absolute',
          inset: 0,
        }}
      >
        {images.length > 0 && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >
            {images.map((image, i) => {
              const isActive = i === currentIndex;
              const isPreload =
                i === (currentIndex + 1) % images.length ||
                i === (currentIndex - 1 + images.length) % images.length ||
                i === (currentIndex + 2) % images.length ||
                i === (currentIndex - 2 + images.length) % images.length; // 扩大预加载范围

              return (
                <Box
                  key={image.links?.feed}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: isActive ? 1 : 0,
                    visibility: isActive || isPreload ? 'visible' : 'hidden',
                    transition: isDragging ? 'none' : 'opacity 0.15s ease-out',
                    zIndex: isActive ? 2 : isPreload ? 1 : 0,
                  }}
                >
                  <FortressImage
                    src={image.links?.feed || ''}
                    alt={`${variant.name} 360° view ${i + 1}`}
                    ratio={1}
                    lazy={position === 0 ? i > 0 : true}
                    draggable={false}
                    onLoad={() => handleImageLoad(i)}
                    sizes={['0.7-md', '1-sm', '1-xs']}
                    sx={{
                      userSelect: 'none',
                      pointerEvents: 'none',
                      height: '100%',
                      '--AspectRatio-paddingBottom': 0,
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </animated.div>

      {images.length > 0 && !loading && (
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '90%',
            transform: 'translate(-50%, -50%)',
            zIndex: 4,
          }}
        >
          <Stack
            direction={'row'}
            justifyContent={'center'}
            alignItems={'center'}
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.3)',
              color: 'white',
              ...(desktop
                ? {
                    px: '27px',
                    py: '14px',
                    height: '46px',
                    borderRadius: '46px',
                  }
                : {
                    px: '20px',
                    py: '10px',
                    height: '40px',
                    borderRadius: '40px',
                  }),
            }}
          >
            <Stack
              alignItems={'center'}
              mr={desktop ? '14px' : '8px'}
              sx={{
                position: 'relative',
                '& svg': {
                  width: desktop ? '50px' : '38px',
                  height: desktop ? '40px' : '30px',
                  stroke: '#fff',
                },
              }}
            >
              <ThreeSixty />

              {/* <Typography
                level="body1"
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '40%',
                  transform: 'translate(-50%, -50%) scale(0.75)',
                  color: 'white',
                }}
              >
                360º
              </Typography> */}
            </Stack>

            <Typography
              level="body1"
              sx={{
                color: 'white',
              }}
            >
              Drag to Spin
            </Typography>
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export default ThreeSixtyViewImage;
