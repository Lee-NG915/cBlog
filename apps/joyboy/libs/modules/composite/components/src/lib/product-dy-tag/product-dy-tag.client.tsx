'use client';

import { useEffect } from 'react';
import { DYPageTypes } from '@castlery/modules-dy-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectBundleVariants, selectProduct, selectVariant } from '@castlery/modules-product-domain';

export const ProductDyTagClient = () => {
  const product = useAppSelector(selectProduct);
  const variant = useAppSelector(selectVariant);
  const bundleVariant = useAppSelector(selectBundleVariants);

  useEffect(() => {
    const updateDyContext = () => {
      if (window.DY) {
        const isBundle = product?.product_type === 'bundle';
        const finalSku = isBundle ? bundleVariant?.sku : variant?.sku;
        if (finalSku) {
          window.DY.recommendationContext = {
            type: DYPageTypes.PRODUCT,
            data: [finalSku],
          };
        }
      }
    };

    updateDyContext();

    const handleHashChange = () => {
      updateDyContext();
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [product, variant, bundleVariant]);

  return <></>;
};
