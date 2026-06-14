'use client';
import { usePathname, useParams } from 'next/navigation';
import { useMemo } from 'react';
import { DYResourceTag } from '../dy-resource-tag/dy-resource-tag';
import { DYPageTypes } from '@castlery/modules-dy-domain';

export const WebDyScripts = ({ categoryOriginalPathname }: { categoryOriginalPathname: string }) => {
  const pathname = usePathname();
  const params = useParams();

  // 是否使用公共集成
  // plp/clp, pdp/pla, cart, home 均不使用公共集成
  const usePublicIntegration = useMemo(() => {
    const specialCategoryPageReg = /^\/[^/]+\/[^/]+\/[^/]+\/(categories|search|sales|collections)\/[^/]+(\/[^/]+)?\/?$/;

    if (categoryOriginalPathname && specialCategoryPageReg.test(categoryOriginalPathname)) {
      return false;
    }

    const excludedPathPatterns = [
      /^\/[^/]+\/(search|collections|sales|categories)(\/[^/]+){1,2}\/?$/, // categoryPageReg
      /^\/[^/]+\/(products|pla)\/.+$/, // productPageReg
      /^\/[^/]+\/cart\/?$/, // cartPageReg
      /^\/[^/]+\/[^/]+\/[^/]+\/home\/?$/, // homePageReg
    ];

    return !excludedPathPatterns.some((pattern) => pattern.test(pathname));
  }, [pathname, categoryOriginalPathname]);

  if (!usePublicIntegration) {
    return null;
  }
  const pageType =
    pathname === `/${params.region}` || pathname === `/${params.region}/` ? DYPageTypes.HOME : DYPageTypes.OTHER;

  if (pageType === DYPageTypes.HOME) {
    return null;
  }

  return <DYResourceTag recommendationContext={{ type: pageType, data: [] }} />;
};
