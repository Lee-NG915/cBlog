'use client';
import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /**
   * 触发加载的距离底部的阈值（像素）
   */
  threshold?: number;
  /**
   * 是否正在加载
   */
  isLoading: boolean;
  /**
   * 是否还有更多数据
   */
  hasMore: boolean;
  /**
   * 加载更多的回调函数
   */
  onLoadMore: () => void;
  /**
   * 是否启用（可用于条件性禁用）
   */
  enabled?: boolean;
}

/**
 * 无限滚动 Hook
 * @description 监听滚动事件，当接近底部时自动加载更多数据
 */
export function useInfiniteScroll({
  threshold = 300,
  isLoading,
  hasMore,
  onLoadMore,
  enabled = true,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && !isLoading && hasMore && enabled) {
        onLoadMore();
      }
    },
    [isLoading, hasMore, onLoadMore, enabled]
  );

  useEffect(() => {
    const element = triggerRef.current;
    if (!element || !enabled) return;

    // 创建 IntersectionObserver
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null, // 使用视口作为根元素
      rootMargin: `${threshold}px`, // 提前触发加载
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold, enabled]);

  return { triggerRef };
}
