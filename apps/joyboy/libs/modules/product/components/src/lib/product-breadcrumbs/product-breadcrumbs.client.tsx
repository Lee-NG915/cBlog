'use client';
import { useMemo } from 'react';
import { Product, selectProduct } from '@castlery/modules-product-domain';
import { RefinedBreadcrumbs, useProductBreadcrumbs } from '@castlery/shared-components';
import { useSelector } from '@castlery/shared-redux-store';

export const ProductBreadcrumbsClient = () => {
  const product = useSelector(selectProduct) as Product;
  const productBreadcrumbs = useProductBreadcrumbs(undefined, product);
  const processedProductBreadcrumbs = useMemo(() => {
    return productBreadcrumbs?.map((item: { name: string; url?: string; permalink: string; level: number }) => {
      return {
        title: item.name,
        url: item.url || '',
      };
    });
  }, [productBreadcrumbs]);
  return <RefinedBreadcrumbs name={product?.name} productBreadcrumbs={processedProductBreadcrumbs} />;
};
