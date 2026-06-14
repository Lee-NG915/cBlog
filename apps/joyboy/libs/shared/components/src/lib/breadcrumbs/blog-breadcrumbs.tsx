'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, useBreakpoints, typographyClasses } from '@castlery/fortress';
import { CustomLink } from '../custom-link/custom-link';
import { useParams } from 'next/navigation';

// 防抖函数
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const BlogBreadcrumbs = ({
  ancestorCrumbs,
  name,
  needLeftPadding,
}: {
  ancestorCrumbs?: {
    pageKey?: string;
    url?: string;
    title: string;
  }[];
  name?: string;
  needLeftPadding?: boolean;
}) => {
  const { desktop } = useBreakpoints();
  const { region } = useParams();

  const [needPadding, setNeedPadding] = useState(false);

  const updatePadding = useCallback(() => {
    setNeedPadding(window.innerWidth <= 1775);
  }, []);

  // 防抖的更新函数
  const debouncedUpdatePadding = useCallback(debounce(updatePadding, 100), [updatePadding]);

  useEffect(() => {
    updatePadding(); // 初始化时调用

    // 只在客户端添加事件监听器
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedUpdatePadding);

      return () => {
        window.removeEventListener('resize', debouncedUpdatePadding);
      };
    }
  }, [debouncedUpdatePadding]);

  return (
    <Typography
      // direction={'row'}
      sx={{
        maxWidth: 1728,
        px: needPadding ? (needLeftPadding ? (desktop ? 3 : 1) : 0) : 0,
        py: 1.5,
        [`& .${typographyClasses.root}`]: {
          color: (theme) => theme.palette.brand.charcoal[400],
          fontSize: 14,
        },

        a: {
          textDecoration: 'none',
          color: (theme) => theme.palette.text.secondary,
          fontSize: 14,
          '&:hover': {
            color: (theme) => theme.palette.brand.terracotta[500],
          },
        },
      }}
    >
      {desktop && (
        <Typography>
          <CustomLink href={`/${region}/`} isExternalFlag={true}>
            Home
          </CustomLink>
          <Typography sx={{ marginLeft: 2, marginRight: 2 }}>&gt;</Typography>
        </Typography>
      )}
      {ancestorCrumbs?.map((a, index) => {
        const { pageKey, url } = a;
        const linkProps = pageKey ? { linkKey: pageKey } : { href: url, isExternalFlag: true };
        if (index === ancestorCrumbs.length - 1 && !name) {
          return <Typography key={index}>{a.title}</Typography>;
        }
        return (
          <Typography key={index}>
            <CustomLink {...linkProps}>{a.title}</CustomLink>
            {!desktop && index === ancestorCrumbs.length - 1 ? null : (
              <Typography sx={{ marginLeft: 2, marginRight: 2 }}>&gt;</Typography>
            )}
          </Typography>
        );
      })}
      <Typography>{name}</Typography>
    </Typography>
  );
};

export default BlogBreadcrumbs;
