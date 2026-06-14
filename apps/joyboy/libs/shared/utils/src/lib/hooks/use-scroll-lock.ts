'use client';

import { useEffect } from 'react';

/**
 * 锁定页面滚动的 Hook
 * @param isLocked 是否锁定滚动
 */
export const useScrollLock = (isLocked: boolean): void => {
  useEffect(() => {
    if (!isLocked) return;

    // 保存当前滚动位置
    const scrollY = window?.scrollY || 0;
    const body = document?.body;
    const html = document?.documentElement;

    // 保存原始的滚动行为
    const originalBodyScrollBehavior = body?.style.scrollBehavior || '';
    const originalHtmlScrollBehavior = html?.style.scrollBehavior || '';

    if (body && html) {
      // 禁用所有可能的滚动动画
      body.style.scrollBehavior = 'auto';
      html.style.scrollBehavior = 'auto';

      // 设置 body 样式来阻止滚动
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
    }

    return () => {
      if (body && html) {
        // 恢复样式
        body.style.overflow = '';
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.transition = '';
        html.style.transition = '';

        // 使用 requestAnimationFrame 确保立即执行
        requestAnimationFrame(() => {
          // 立即设置滚动位置，不使用任何动画
          if (window?.scrollTo) {
            window.scrollTo({ top: scrollY, behavior: 'auto' });
          }

          // 恢复原始的滚动行为
          body.style.scrollBehavior = originalBodyScrollBehavior;
          html.style.scrollBehavior = originalHtmlScrollBehavior;
        });
      }
    };
  }, [isLocked]);
};
