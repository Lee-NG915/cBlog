'use client';

import React, { useCallback } from 'react';
import NextLink from 'next/link';
import { Link, SxProps } from '@castlery/fortress';
import { dt, EventsNames } from '@castlery/data-tracking-events';
import { logger } from '@castlery/observability/client';

export interface TrackableLinkProps {
  /**
   * 链接路径
   */
  path: string;
  /**
   * 菜单类型，用于数据追踪
   */
  menuType: string;
  /**
   * 链接文本
   */
  text?: string;
  /**
   * 链接内容
   */
  children?: React.ReactNode;
  /**
   * 是否使用原生a标签
   */
  isOriginal?: boolean;
  /**
   * 点击事件回调
   */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /**
   * 自定义样式类名
   */
  className?: string;
  /**
   * 打开链接的目标窗口
   */
  target?: string;
  /**
   * Joy UI 样式属性
   */
  sx?: SxProps;
  /**
   * 其他属性
   */
  [key: string]: any;
}

export const TrackableLink = ({
  path,
  menuType,
  text,
  children,
  isOriginal = false,
  onClick,
  className,
  target,
  sx,
  ...otherProps
}: TrackableLinkProps) => {
  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const href = e.currentTarget.href;

      try {
        dt.track(EventsNames.EVENT_LINK_CLICK)({
          category: 'link_click',
          action: menuType,
          label: text,
          link: href,
        });
        return Promise.resolve();
      } catch (e) {
        // Tracking error should not block the main flow
        logger.error('Failed to track link click event', { error: e, href, menuType });
      }

      if (onClick) {
        onClick(e);
      }
    },
    [onClick, menuType, text]
  );

  // 判断链接是否有效
  const hasPath = !!path;

  // 外部链接或者指定使用原生标签时
  if (isOriginal || path?.startsWith('http') || path?.startsWith('//')) {
    return (
      <a
        href={path}
        role="button"
        onClick={handleLinkClick}
        target={target || '_self'}
        data-category="link_click"
        data-action={menuType}
        data-label={text}
        style={{ textDecoration: 'none' }}
        {...otherProps}
      >
        {children || text}
      </a>
    );
  }

  // 内部链接使用Next.js的Link组件
  return (
    <NextLink href={hasPath ? path : '#'} passHref {...otherProps} style={{ textDecoration: 'none' }} prefetch={false}>
      <Link
        sx={{
          textDecoration: 'none',
          cursor: hasPath ? 'pointer' : 'default',
          ...sx,
        }}
        onClick={handleLinkClick}
        data-category="link_click"
        data-action={menuType}
        data-label={text}
        target={target}
      >
        {children || text}
      </Link>
    </NextLink>
  );
};
