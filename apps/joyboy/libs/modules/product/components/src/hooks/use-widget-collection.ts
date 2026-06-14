'use client';

import { Product, selectProduct } from '@castlery/modules-product-domain';
import { findCollectionFromProductName } from '@castlery/modules-product-services';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useMemo } from 'react';

export const useWidgetCollection = () => {
  const product = useAppSelector(selectProduct) as Product;

  const collection = useMemo(() => {
    return findCollectionFromProductName(product?.name);
  }, [product?.name]);

  return {
    collection,
    product,
  };
};
