'use client';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCMSOriginalMenuData } from '@castlery/modules-cms-domain';
import { Product, selectProduct } from '@castlery/modules-product-domain';

// export const useAncestorCrumbs = () => {
//   const menuData = useAppSelector(selectCMSOriginalMenuData);
//   console.log('-----useAncestorCrumbs---', menuData);
//   return { menuData };
// };

export const useProductBreadcrumbs = (
  customeProductBreadcrumbs?: {
    name: string;
    level: number;
    permalink: string;
  }[],
  productData?: Product
): Array<{
  name: string;
  permalink: string;
  level: number;
  url?: string;
}> => {
  const reduxProduct = useAppSelector(selectProduct);
  const product = productData || reduxProduct;
  const menuData = useAppSelector(selectCMSOriginalMenuData);
  const productBreadcrumbs = product?.breadcrumbs?.filter((item) => item.level === 1 || item.level === 2);

  const baseBreadcrumbs =
    Array.isArray(customeProductBreadcrumbs) && customeProductBreadcrumbs.length > 0
      ? customeProductBreadcrumbs
      : productBreadcrumbs;
  const firstPage = baseBreadcrumbs?.[0]?.permalink;
  const secondPage = baseBreadcrumbs?.[1]?.permalink;

  if (!firstPage || !secondPage) {
    return [];
  }
  const target = menuData?.children?.find((item: any) => item.permalink === firstPage);
  if (!target) {
    return baseBreadcrumbs;
  }

  const targetChilds = target?.children;
  const rightChild = targetChilds?.find((item: any) => item.permalink === secondPage);

  const arr = baseBreadcrumbs?.map((item: { name: string; permalink: string; level: number }) => {
    if (item.permalink === firstPage) {
      return { ...item, url: target?.url };
    }
    if (item.permalink === secondPage) {
      return { ...item, url: rightChild?.url };
    }
    return item;
  });
  return arr || [];
};
