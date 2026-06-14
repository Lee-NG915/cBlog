'use client';

import { Button, Stack, Theme, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowLeft, ArrowRight } from '@castlery/fortress/Icons';
import { DtStack } from '@castlery/modules-tracking-components';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useEffect, useRef, useState, useCallback } from 'react';
import { hasRichText } from '../../utils/rich-text-utils';
import { RichTextTypography } from '../component-v1/components';
import { UGCListing, UGCListingProps } from '../component-v1/ugc/ugc-listing';
import { SocialUgcModal } from './components/social-ugc-modal';

interface SocialUGCProps {
  blok: {
    header: string;
    text: string;
    background_color: string;
    navigation_display: boolean;
    items: UGCListingProps[];
    header_color: string;
    nums_in_line: '4' | '6';
    _uid: string;
    ratio: 'square' | 'rectangle';
  };
  ref?: React.RefObject<HTMLDivElement>;
}

const SocialUGC = ({ blok, ref }: SocialUGCProps) => {
  const defaultRef = useRef<HTMLDivElement>(null);
  const socialUgcRootRef = ref || defaultRef;
  const {
    header,
    text,
    background_color,
    navigation_display,
    items,
    header_color,
    nums_in_line,
    _uid,
    ratio = 'square',
  } = blok;
  const containerRef = useRef<HTMLDivElement>(null);
  const itemCount = items.length;
  const { desktop } = useBreakpoints();
  const [firstClicked, setFirstClicked] = useState(false);

  const generalWidth = desktop ? (nums_in_line === '4' ? 420 : 290) : nums_in_line === '4' ? 256 : 252;
  const generalWidthWithoutMargin = desktop ? (nums_in_line === '4' ? 404 : 278) : 240;
  const generalHeight = ratio === 'square' ? generalWidthWithoutMargin : generalWidthWithoutMargin * 1.78;

  const [modalOpen, setModalOpen] = useState(false);

  // 克隆结构：[cloneLast, ...original, cloneFirst]
  const loopedItems = [...items, ...items, ...items];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [clickedIndex, setClickedIndex] = useState(0);
  const [firstEnter, setFirstEnter] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  // 记录在视窗里完整出现的元素索引数组
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  // 存储每个元素的 ref
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  // 存储节流定时器的 ref
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => prev - 1);
    setFirstEnter(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setFirstEnter(true);
  };

  useEffect(() => {
    if (itemCount > 0 && containerRef.current) {
      setCurrentIndex(itemCount);
      const transformValue = `translateX(-${itemCount * generalWidth}px)`;
      containerRef.current.style.transition = 'none';
      containerRef.current.style.transform = transformValue;
      // 强制重绘
      const _ = containerRef.current.offsetHeight;
      containerRef.current.style.transition = 'transform 0.3s ease-in-out';
    }
  }, [itemCount, generalWidth]);

  useEffect(() => {
    if (containerRef.current) {
      if (currentIndex === itemCount * 2 || currentIndex === 0) {
        if (firstEnter) {
          setTimeout(() => {
            const transformValue = `translateX(-${itemCount * generalWidth}px)`;
            if (containerRef.current) {
              containerRef.current.style.transition = 'none';
              containerRef.current.style.transform = transformValue;
              // 强制重绘
              const __ = containerRef.current.offsetHeight;
              window.setTimeout(() => {
                if (containerRef.current) {
                  containerRef.current.style.transition = 'transform 0.3s ease-in-out';
                }
              }, 50);
            }
            setCurrentIndex(itemCount);
          }, 500);
        } else {
          const transformValue = `translateX(-${itemCount * generalWidth}px)`;
          if (containerRef.current) {
            containerRef.current.style.transition = 'none';
            containerRef.current.style.transform = transformValue;
            // 强制重绘
            const __ = containerRef.current.offsetHeight;
            window.setTimeout(() => {
              if (containerRef.current) {
                containerRef.current.style.transition = 'transform 0.3s ease-in-out';
              }
            }, 50);
          }
          setCurrentIndex(itemCount);
        }
      }
    }
  }, [currentIndex, itemCount, generalWidth]);

  useEffect(() => {
    if (containerRef.current) {
      const transformValue = `translateX(-${currentIndex * generalWidth}px)`;
      containerRef.current.style.transform = transformValue;
    }
  }, [currentIndex, generalWidth]);

  // 检查元素是否至少80%在视窗内
  const checkVisibleItems = useCallback(() => {
    const visible: number[] = [];
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    itemRefs.current.forEach((element, index) => {
      if (element) {
        const rect = element.getBoundingClientRect();

        // 计算元素在视口内的可见区域
        const visibleLeft = Math.max(rect.left, 0);
        const visibleTop = Math.max(rect.top, 0);
        const visibleRight = Math.min(rect.right, viewportWidth);
        const visibleBottom = Math.min(rect.bottom, viewportHeight);

        // 计算可见宽度和高度
        const visibleWidth = Math.max(0, visibleRight - visibleLeft);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        // 计算可见面积和总面积
        const visibleArea = visibleWidth * visibleHeight;
        const totalArea = rect.width * rect.height;

        // 检查是否至少80%可见
        const visibilityRatio = totalArea > 0 ? visibleArea / totalArea : 0;
        const isEightyPercentVisible = visibilityRatio >= 0.8;

        if (isEightyPercentVisible) {
          if (loopedItems[index].video.length > 0) {
            visible.push(index);
          }
        }
      }
    });

    // 只有当 visibleItems 真正改变时才更新状态
    setVisibleItems((prevVisible) => {
      // 比较数组是否相同（长度和内容）
      if (prevVisible.length !== visible.length) {
        return visible;
      }
      const isEqual = prevVisible.every((val, idx) => val === visible[idx]);
      return isEqual ? prevVisible : visible;
    });
  }, [loopedItems]);

  // 节流的滚动处理函数
  const throttledCheckVisible = useCallback(() => {
    if (throttleTimerRef.current) {
      return;
    }
    throttleTimerRef.current = setTimeout(() => {
      checkVisibleItems();
      throttleTimerRef.current = null;
    }, 100);
  }, [checkVisibleItems]);

  const handlePlaybackStateChange = (state: 'playing' | 'paused' | 'ended', index: number) => {
    // 保留原有的播放状态变化处理，但不再在这里处理切换逻辑
    // 切换逻辑现在由 onShouldSwitch 处理
  };

  const handleShouldSwitch = (index: number) => {
    // 当视频播放到3秒或视频时长小于3秒且播放结束时，切换到下一个视频
    const currentIndexInVisible = visibleItems.indexOf(index);
    if (currentIndexInVisible !== -1) {
      if (currentIndexInVisible === visibleItems.length - 1) {
        // 如果是最后一个，播放第一个
        setCurrentPlayingIndex(visibleItems[0]);
      } else {
        // 播放下一个
        setCurrentPlayingIndex(visibleItems[currentIndexInVisible + 1]);
      }
    }
  };

  useEffect(() => {
    if (visibleItems.length > 0) {
      // 检查当前的 currentPlayingIndex 是否还在 visibleItems 中
      setCurrentPlayingIndex((prevIndex) => {
        if (prevIndex !== null && visibleItems.includes(prevIndex)) {
          // 如果还在，继续播放当前视频（不改变值）
          return prevIndex;
        } else {
          // 如果不在，从 visibleItems 的第一个开始播放
          const newIndex = visibleItems[0];
          // 只有当新值不同于旧值时才返回新值
          return prevIndex !== newIndex ? newIndex : prevIndex;
        }
      });
    } else {
      setCurrentPlayingIndex((prevIndex) => {
        // 只有当当前值不是 null 时才更新
        return prevIndex !== null ? null : prevIndex;
      });
    }
  }, [visibleItems]);

  // 初始化和监听窗口大小变化及滚动事件
  useEffect(() => {
    // 初始检查
    const timeoutId = setTimeout(() => {
      checkVisibleItems();
    }, 100);

    // 监听窗口 resize 事件
    const handleResize = () => {
      checkVisibleItems();
    };

    // 监听滚动事件（包括 window 和可能的容器滚动）
    const handleScroll = () => {
      throttledCheckVisible();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    // 如果容器有滚动，也监听容器的滚动
    const rootElement = socialUgcRootRef.current;
    if (rootElement) {
      rootElement.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      clearTimeout(timeoutId);
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (rootElement) {
        rootElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [checkVisibleItems, throttledCheckVisible, itemCount, generalWidth, socialUgcRootRef]);

  // 当 currentIndex 变化时重新检查可见元素
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkVisibleItems();
    }, 350); // 等待动画完成

    return () => clearTimeout(timeoutId);
  }, [currentIndex, checkVisibleItems]);

  return (
    <DtStack useImpression {...storyblokEditable(blok)} componentName="social-ugc" uid={_uid} key={_uid}>
      <Stack
        key="social-ugc-content"
        ref={socialUgcRootRef}
        sx={(theme) => ({
          width: '100%',
          backgroundColor: background_color,
          padding: desktop ? `60px 0` : `32px 0`,
          px: desktop && nums_in_line === '4' ? '32px' : 0,
        })}
      >
        <Stack alignItems="center">
          <Typography
            level="h2"
            sx={(theme) => ({
              color: header_color || theme.palette.brand.maroonVelvet[500],
              marginBottom: '8px',
              marginLeft: desktop ? '32px' : '24px',
              marginRight: desktop ? '32px' : '24px',
            })}
          >
            {header}
          </Typography>
          {hasRichText(text) && (
            <RichTextTypography
              level="body1"
              sx={(theme) => ({
                color: `${theme.palette.brand.maroonVelvet[500]}`,
                marginBottom: desktop ? '32px' : '20px',
                marginLeft: desktop ? '32px' : '24px',
                marginRight: desktop ? '32px' : '24px',
                p: {
                  textAlign: 'center',
                },
                a: {
                  color: `${theme.palette.brand.terracotta[500]} !important`,
                  textDecorationColor: `${theme.palette.brand.terracotta[500]} !important`,
                  span: {
                    color: `${theme.palette.brand.terracotta[500]} !important`,
                    '&:hover': {
                      color: `${theme.palette.brand.terracotta[600]} !important`,
                    },
                  },
                  '&:hover': {
                    color: `${theme.palette.brand.terracotta[600]} !important`,
                    textDecorationColor: `${theme.palette.brand.terracotta[600]} !important`,
                  },
                },
              })}
              description={text}
            />
          )}
        </Stack>
        <Stack sx={{ overflow: 'hidden' }}>
          <Stack
            ref={containerRef}
            sx={(theme) => ({
              display: 'flex',
              flexDirection: 'row',
              width: 'auto',
              transition: 'transform 0.3s ease-in-out',
              gap: nums_in_line === '4' ? '16px' : '12px',
            })}
          >
            {loopedItems.map((item, index) => (
              <Stack
                key={`ugc-${index}`}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(index, el);
                  } else {
                    itemRefs.current.delete(index);
                  }
                }}
                sx={(theme) => ({
                  width: generalWidthWithoutMargin,
                  height: generalHeight,
                  flexShrink: 0,
                  cursor: 'pointer',
                })}
                onClick={() => {
                  if (!firstClicked) {
                    setFirstClicked(true);
                    setTimeout(() => {
                      setModalOpen(true);
                      setClickedIndex(index);
                    }, 300);
                  } else {
                    setModalOpen(true);
                    setClickedIndex(index);
                  }
                }}
              >
                <UGCListing
                  blok={item}
                  enableLink={false}
                  useControlledVideo={true}
                  outerWidth={generalWidthWithoutMargin}
                  outerHeight={generalHeight}
                  isPlaying={currentPlayingIndex === index}
                  sizes={[
                    '0.8-xs',
                    `${nums_in_line === '4' ? 0.25 : 0.18}-md`,
                    `${nums_in_line === '4' ? 0.25 : 0.18}-lg`,
                    `${(nums_in_line === '4' ? 0.25 : 0.18) * 0.8}-xl`,
                  ]}
                  onPlaybackStateChange={(state) => handlePlaybackStateChange(state, index)}
                  onShouldSwitch={() => handleShouldSwitch(index)}
                />
              </Stack>
            ))}
          </Stack>

          {navigation_display && (
            <Stack
              sx={(theme) => ({
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                mt: desktop ? '32px' : '16px',
                paddingRight: desktop ? '32px' : '24px',
              })}
            >
              <Button
                aria-label="Previous"
                sx={(theme: Theme) => ({
                  width: desktop ? 64 : `${40}px !important`,
                  height: desktop ? 64 : `${40}px !important`,
                  padding: 0,
                  minHeight: desktop ? 64 : `${40}px !important`,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.brand.warmLinen[500],
                  boxShadow: 'none',
                  marginRight: desktop ? '24px' : '16px',
                  border: 'none !important',
                  '&:hover': {
                    backgroundColor: theme.palette.brand.warmLinen[500],
                    boxShadow: 'none !important',
                  },
                  '&:focus': {
                    boxShadow: 'none !important',
                  },
                  '&:active': {
                    boxShadow: 'none !important',
                  },
                })}
                onClick={handlePrev}
              >
                <ArrowLeft
                  sx={(theme: Theme) => ({
                    color: theme.palette.brand.burntOrange[500],
                  })}
                />
              </Button>
              <Button
                aria-label="Next"
                sx={(theme: Theme) => ({
                  width: desktop ? 64 : `${40}px !important`,
                  height: desktop ? 64 : `${40}px !important`,
                  padding: 0,
                  minHeight: desktop ? 64 : `${40}px !important`,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.brand.warmLinen[500],
                  boxShadow: 'none',
                  border: 'none !important',
                  '&:hover': {
                    backgroundColor: theme.palette.brand.warmLinen[500],
                    boxShadow: 'none !important',
                  },
                  '&:focus': {
                    boxShadow: 'none !important',
                  },
                  '&:active': {
                    boxShadow: 'none !important',
                  },
                })}
                onClick={handleNext}
              >
                <ArrowRight
                  sx={(theme: Theme) => ({
                    color: theme.palette.brand.burntOrange[500],
                  })}
                />
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>
      {firstClicked && (
        <SocialUgcModal
          key="social-ugc-modal"
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          ugcData={items}
          initialIndex={clickedIndex % itemCount}
        />
      )}
    </DtStack>
  );
};

export { SocialUGC };
