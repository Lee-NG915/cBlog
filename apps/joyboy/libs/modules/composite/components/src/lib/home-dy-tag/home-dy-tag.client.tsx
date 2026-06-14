'use client';

import { useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { DYPageTypes } from '@castlery/modules-dy-domain';

export const HomeDyTagClient = () => {
  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.DY) {
      return;
    }
    // 只在 Home Page 时设置 context
    // Home Page 路径格式: /[deviceTheme]/[region]/[locale]/home
    const isHomePage = pathname === `/${params.region}` || pathname === `/${params.region}/`;
    if (!isHomePage) {
      return;
    }
    window.DY.recommendationContext = {
      type: DYPageTypes.HOME,
      data: [],
    };
  }, [pathname, params]);

  return null;
};
