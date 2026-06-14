'use client';

import { Box, Button, Stack, useBreakpoints } from '@castlery/fortress';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShopTheLookItem } from '../shop-the-look-item/shop-the-look-item';
import { FortressImage } from '@castlery/shared-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { DtStack } from '@castlery/modules-tracking-components';
import { getShopTheLookVariant, setShopTheLookVariantData } from '@castlery/modules-product-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';

export interface ShopTheLookListProps {
  blok: {
    items: any[];
    show_thumbnail_images: boolean;
    show_view_all_products: boolean;
    _uid: string;
  };
}

const ShopTheLookList = ({ blok }: ShopTheLookListProps) => {
  const { items, show_view_all_products, _uid } = blok;
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // 从原始第一个开始
  const [isFetching, setIsFetching] = useState(false);

  // 拖拽相关状态
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragCurrentXRef = useRef(0);

  // 触摸相关状态
  const [isTouching, setIsTouching] = useState(false);
  const touchStartXRef = useRef(0);
  const touchCurrentXRef = useRef(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Drawer 状态
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { desktop } = useBreakpoints();

  const handleClickThumbnail = (index: number) => {
    setCurrentIndex(index);
  };

  // 处理 Drawer 状态变化
  const handleDrawerStateChange = useCallback((isOpen: boolean) => {
    setIsDrawerOpen(isOpen);
  }, []);

  // 鼠标按下事件处理
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 在桌面端禁用拖拽功能
      if (desktop) {
        return;
      }

      // 如果 Drawer 打开，禁用拖拽功能
      if (isDrawerOpen) {
        return;
      }

      // 不要立即阻止默认行为，只在确认是拖拽时才阻止
      setIsDragging(true);
      dragStartXRef.current = e.clientX;
      dragCurrentXRef.current = e.clientX;
    },
    [isDrawerOpen, desktop]
  );

  // 鼠标移动事件处理
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // 在桌面端禁用拖拽功能
      if (desktop) {
        return;
      }

      if (!isDragging) return;

      dragCurrentXRef.current = e.clientX;
    },
    [isDragging, desktop]
  );

  // 鼠标松开事件处理
  const handleMouseUp = useCallback(
    (e?: React.MouseEvent) => {
      // 在桌面端禁用拖拽功能
      if (desktop) {
        return;
      }

      if (!isDragging) return;

      const dragDistance = Math.abs(dragCurrentXRef.current - dragStartXRef.current);

      // 只有当拖拽距离超过20px时才处理
      if (dragDistance > 20) {
        const dragDirection = dragCurrentXRef.current - dragStartXRef.current;

        if (dragDirection > 0) {
          // 向右拖拽，显示前一个
          setCurrentIndex((prev) => Math.max(0, prev - 1));
        } else {
          // 向左拖拽，显示后一个
          setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1));
        }
      }

      // 重置拖拽状态
      setIsDragging(false);
      dragStartXRef.current = 0;
      dragCurrentXRef.current = 0;
    },
    [isDragging, items.length, desktop]
  );

  // 鼠标离开事件处理
  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      // 在桌面端禁用拖拽功能
      if (desktop) {
        return;
      }

      if (isDragging) {
        handleMouseUp();
      }
    },
    [isDragging, handleMouseUp, desktop]
  );

  // 触摸开始事件处理
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // 在桌面端禁用触摸滑动功能
      if (desktop) {
        return;
      }

      // 如果 Drawer 打开，禁用触摸滑动功能
      if (isDrawerOpen) {
        return;
      }

      // 不要立即阻止默认行为，只在确认是滑动时才阻止
      setIsTouching(true);
      setIsSwiping(false);
      touchStartXRef.current = e.touches[0].clientX;
      touchCurrentXRef.current = e.touches[0].clientX;
    },
    [isDrawerOpen, desktop]
  );

  // 触摸移动事件处理
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // 在桌面端禁用触摸滑动功能
      if (desktop) {
        return;
      }

      if (!isTouching) return;

      const touchDistance = Math.abs(e.touches[0].clientX - touchStartXRef.current);

      // 只有当滑动距离超过10px时标记为滑动状态
      // 不调用 preventDefault()，依赖 CSS touch-action 属性来控制触摸行为
      if (touchDistance > 10) {
        setIsSwiping(true);
      }

      touchCurrentXRef.current = e.touches[0].clientX;
    },
    [isTouching, desktop]
  );

  // 触摸结束事件处理
  const handleTouchEnd = useCallback(() => {
    // 在桌面端禁用触摸滑动功能
    if (desktop) {
      return;
    }

    if (!isTouching) return;

    const touchDistance = Math.abs(touchCurrentXRef.current - touchStartXRef.current);

    // 只有当触摸滑动距离超过20px且确实在滑动时才处理
    if (touchDistance > 20 && isSwiping) {
      const touchDirection = touchCurrentXRef.current - touchStartXRef.current;

      if (touchDirection > 0) {
        // 向右滑动，显示前一个
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else {
        // 向左滑动，显示后一个
        setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1));
      }
    }

    // 重置触摸状态
    setIsTouching(false);
    setIsSwiping(false);
    touchStartXRef.current = 0;
    touchCurrentXRef.current = 0;
  }, [isTouching, items.length, isSwiping, desktop]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex]);

  // 添加全局鼠标事件监听器，确保拖拽功能正常工作
  useEffect(() => {
    // 在桌面端禁用拖拽功能
    if (desktop) {
      return;
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        dragCurrentXRef.current = e.clientX;
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleMouseUp, desktop]);

  const getShopTheLookVariantInClient = useCallback(
    async (productIds: string[]) => {
      const result = await dispatch(getShopTheLookVariant.initiate(productIds.join(',')));
      const shopTheLookVariantData: any[] = result.data || [];
      dispatch(setShopTheLookVariantData(shopTheLookVariantData));
      setIsFetching(false);
    },
    [dispatch]
  );

  useEffect(() => {
    if (items.length > 0) {
      const productIds = new Set<string>();
      items.forEach((item: any) => {
        if (item.hotspots.length > 0) {
          item.hotspots.forEach((hotspot: any) => {
            if (hotspot.variant_id) {
              productIds.add(hotspot.variant_id);
            }
          });
        }
      });
      getShopTheLookVariantInClient([...productIds]);
    }
  }, [items, getShopTheLookVariantInClient]);

  if (isFetching) {
    return null;
  }

  return (
    <DtStack useImpression {...storyblokEditable(blok)} componentName="shop-the-look-list" uid={_uid} key={_uid}>
      <Stack
        sx={{ overflow: 'hidden' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <Stack
          ref={containerRef}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: 'auto',
            transition: 'transform 0.3s ease-in-out',
            cursor: desktop ? 'default' : isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: desktop ? 'auto' : 'pan-y', // 桌面端允许所有触摸操作，移动端控制水平滑动
          }}
        >
          {items.map((item: any, index: number) => (
            <Box key={`${item._uid}-${index}`} sx={{ width: '100%', flexShrink: 0 }}>
              <ShopTheLookItem
                blok={item}
                showViewAllProducts={show_view_all_products}
                onDrawerStateChange={handleDrawerStateChange}
              />
            </Box>
          ))}
        </Stack>
        {!desktop && (
          <Stack
            sx={{
              width: '100%',
              paddingLeft: '16px',
              // paddingRight: '16px',
              height: '4px',
            }}
          >
            <Stack
              sx={{
                width: '100%',
                flexDirection: 'row',
                position: 'relative',
                height: '4px',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {items.map((item: any, index: number) => (
                <Stack
                  key={`${item._uid}-${index}`}
                  onClick={() => handleClickThumbnail(index)}
                  sx={{
                    width: `${100 / items.length}%`,
                    height: '4px !important',
                    backgroundColor: '#F5F5F5 !important',
                  }}
                />
              ))}
              <Stack
                sx={{
                  position: 'absolute',
                  backgroundColor: '#A45B37',
                  width: `${100 / items.length}%`,
                  height: '4px',
                  left: `${(100 / items.length) * currentIndex}%`,
                  top: 0,
                  bottom: 0,
                  zIndex: 2,
                  borderRadius: '8px',
                  // left: `${(100 / items.length) * index}%`,
                }}
              />
            </Stack>
          </Stack>
        )}
        {desktop && (
          <Stack
            sx={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              overflowX: 'scroll',
              // 隐藏滚动条样式，兼容大部分浏览器
              '&::-webkit-scrollbar': {
                display: 'none', // Chrome, Safari, Edge
              },
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE, Edge
            }}
          >
            <Stack
              sx={(theme) => ({
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: theme.spacing(4),
                height: '230px',
              })}
            >
              {items.map((item: any, index: number) => {
                return (
                  <Stack
                    key={`${item._uid}-${index}`}
                    sx={(theme) => ({
                      position: 'relative',
                      // width: desktop ? theme.spacing(70) : theme.spacing(16),
                      // height: desktop ? theme.spacing(52.5) : theme.spacing(16),
                      width: 280,
                      height: 210,
                      cursor: 'pointer',
                    })}
                    onClick={() => handleClickThumbnail(index)}
                  >
                    <FortressImage
                      src={item.image}
                      alt=""
                      imageWidth={280}
                      imageHeight={210}
                      ratio={280 / 210}
                      objectFit="cover"
                      sizes={['0.2-md', '0.3-xs']}
                    />
                    {currentIndex === index && (
                      <Box
                        sx={(theme) => ({
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: '-12px',
                          height: '5px',
                          backgroundColor: theme.palette.brand.maroonVelvet[500],
                          zIndex: 10,
                        })}
                      />
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        backgroundColor: 'transparent',
                        zIndex: 10,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        },
                      }}
                    />
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        )}
      </Stack>
    </DtStack>
  );
};

export { ShopTheLookList };
