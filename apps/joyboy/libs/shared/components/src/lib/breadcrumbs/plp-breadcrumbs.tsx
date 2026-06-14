'use client';

import { Breadcrumbs, Typography, SxProps, breadcrumbsClasses } from '@castlery/fortress';
import { NextFortressLink } from '../next-fortress-link';
import { useParams } from 'next/navigation';
import { ArrowForwardIos } from '@castlery/fortress/Icons';
import React from 'react'; // Added missing import for React

export interface PLPBreadcrumbItem {
  title: string;
  url?: string;
  pageKey?: string;
}

export interface PLPBreadcrumbsProps {
  /** 当前页面名称 */
  currentPageName?: string;
  /** 面包屑项目列表 */
  items?: PLPBreadcrumbItem[];

  /** 自定义样式，可以控制整个面包屑容器 */
  sx?: SxProps;
  /** Home 链接的自定义样式，可以通过响应式控制显示隐藏 */
  homeLinkSx?: SxProps;
}

/**
 * 抽象的带链接的面包屑项目组件
 * 统一处理链接样式和行为
 */
interface BreadcrumbLinkItemProps {
  title: string;
  href?: string;
  linkKey?: string;
  isExternalFlag?: boolean;
  linkVariant?: 'secondary' | 'plain';
  sx?: SxProps;
}

const BreadcrumbLinkItem = ({
  title,
  href,
  linkKey,
  isExternalFlag = true,
  linkVariant = 'plain',
  sx,
}: BreadcrumbLinkItemProps) => {
  const linkProps = linkKey ? { linkKey } : { href, isExternalFlag };

  return (
    <NextFortressLink
      level="caption1"
      variant={linkVariant}
      {...linkProps}
      sx={{
        textDecoration: 'none',
        color: 'var(--fortress-palette-brand-mono-700)',
        '&:hover': {
          color: 'var(--fortress-palette-brand-terracotta-500)',
          textDecoration: 'underline',
        },
        ...sx,
      }}
    >
      {title}
    </NextFortressLink>
  );
};

export const PLPBreadcrumbs = ({ currentPageName, items = [], sx, homeLinkSx }: PLPBreadcrumbsProps) => {
  const { region } = useParams();

  // 如果没有任何面包屑项目且不显示当前页面名称，则不渲染
  if (items.length === 0 && !currentPageName) {
    return null;
  }

  // 检查是否完全隐藏 Home 链接
  const isHomeCompletelyHidden = homeLinkSx && (homeLinkSx as any)?.display === 'none';

  // 构建面包屑项目数组，根据条件包含或排除 Home 链接
  const breadcrumbItems = [];

  // 桌面端或未完全隐藏时添加 Home 链接
  if (!isHomeCompletelyHidden) {
    breadcrumbItems.push({
      key: 'home',
      element: (
        <BreadcrumbLinkItem
          title="Home"
          href={`/${region}`}
          linkVariant="secondary"
          sx={{
            display: { xs: 'none', md: 'inline-flex' }, // 移动端隐藏
            // TODO 兼容写法 不知道哪里导致了 负margin
            mx: 0,
            ...(homeLinkSx as any),
          }}
        />
      ),
    });
  }

  // 添加其他面包屑项目
  items.forEach((item, index) => {
    const { pageKey, url, title } = item;
    if (url) {
      breadcrumbItems.push({
        key: `item-${index}`,
        element: <BreadcrumbLinkItem key={index} title={title} href={url} linkKey={pageKey} />,
      });
    } else {
      breadcrumbItems.push({
        key: `item-${index}`,
        element: <Typography level="caption1">{title}</Typography>,
      });
    }
  });

  // 添加当前页面名称
  if (currentPageName) {
    breadcrumbItems.push({
      key: 'current',
      element: <Typography level="caption1">{currentPageName}</Typography>,
    });
  }

  return (
    // TODO 现在这里的Link有负 margin 的问题
    <Breadcrumbs
      sx={
        {
          // px: { xs: 3, md: 0 },
          px: 0,
          py: 1.5,
          // 分隔符样式 - 确保垂直居中
          // [`& .${breadcrumbsClasses.separator}`]: {
          //   mx: 1,
          //   color: 'var(--fortress-palette-brand-mono-500)',
          //   display: 'flex',
          //   alignItems: 'center',
          //   justifyContent: 'center',
          // },
          // 优化移动端第一个分隔符的处理
          // 当 Home 链接在移动端隐藏时，隐藏第一个分隔符
          [`& .${breadcrumbsClasses.ol} > .${breadcrumbsClasses.li}:first-child + .${breadcrumbsClasses.separator}`]: {
            display: { xs: 'none', md: 'flex' },
          },
          ...sx,
        } as any
      }
    >
      {breadcrumbItems.map((item) => (
        <React.Fragment key={item.key}>{item.element}</React.Fragment>
      ))}
    </Breadcrumbs>
  );
};
