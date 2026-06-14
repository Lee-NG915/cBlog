'use client';

import { useEffect } from 'react';
import { DYPageTypes } from '@castlery/modules-dy-domain';

interface CategoryDyTagClientProps {
  breadcrumbNames: string[];
}

export const CategoryDyTagClient = ({ breadcrumbNames }: CategoryDyTagClientProps) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.DY) {
      return;
    }
    if (!breadcrumbNames?.length) {
      return;
    }
    window.DY.recommendationContext = {
      type: DYPageTypes.CATEGORY,
      data: breadcrumbNames,
    };
  }, [breadcrumbNames]);

  return null;
};
