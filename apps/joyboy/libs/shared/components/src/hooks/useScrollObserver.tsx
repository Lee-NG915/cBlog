'use client';
import { useEffect, useRef } from 'react';
import throttle from 'lodash.throttle';
import { useBreakpoints } from '@castlery/fortress';

export interface UseScrollObserverProps {
  navBarIdSelector: string; // id selector eg:#sticky-nav-bar
  sectionClassSelector: string; // class selector eg:.cms-section
}
export const useScrollObserver = ({ navBarIdSelector, sectionClassSelector }: UseScrollObserverProps) => {
  const navLinks = useRef([]);
  const { desktop } = useBreakpoints();
  const navScrollToView = (el: Element) => {
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest',
      });
    }
  };

  useEffect(() => {
    const sections = document.querySelectorAll(sectionClassSelector);
    const links = document.querySelectorAll(`${navBarIdSelector} a`);
    const observerOptions = {
      root: null, // 默认视口
      threshold: [0.2], // 当元素20%进入视口时触发
    };
    let isUserScrolling = false;
    const observer = new IntersectionObserver(
      throttle((entries) => {
        if (isUserScrolling) return false;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 检查当前可见部分的链接是否已经在数组中
            const activeLink = document.querySelector(`${navBarIdSelector} a[href="#${entry.target.id}"]`);
            if (activeLink) {
              document.body.focus(); // 移除当前聚焦元素的焦点
              // 清除导航项的激活状态
              links.forEach((link) => {
                link.classList.remove('Mui-selected');
                link.setAttribute('aria-selected', 'false');
              });
            }
            // 为当前可见部分的链接添加 aria-selected
            if (activeLink) {
              activeLink.setAttribute('aria-selected', 'true');
              activeLink.classList.add('Mui-selected');
              // 将该项滚动到导航栏的左侧
              navScrollToView(activeLink);
            }
          }
        });
      }, 100),
      observerOptions
    );
    const touchStartHandler = (e) => {
      isUserScrolling = true;
      const activeEl = e.target;
      links.forEach((link) => {
        if (link.id !== activeEl.id) {
          link.classList.remove('Mui-selected');
          link.setAttribute('aria-selected', 'false');
        }
        // 将该项滚动到导航栏的左侧
        navScrollToView(activeEl);
      });
      setTimeout(() => {
        isUserScrolling = false;
      }, 500); // 根据滚动时间调整这个延时
    };
    // 锚点点击事件
    links.forEach((link) => {
      link.addEventListener('click', touchStartHandler);
    });

    // 观察所有 sections
    sections.forEach((section) => {
      observer.observe(section);
    });

    // 清理函数，组件卸载时取消观察
    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
      links.forEach((link) => {
        link.removeEventListener('click', touchStartHandler);
      });
    };
  }, [navBarIdSelector, sectionClassSelector, desktop]);

  return navLinks;
};
