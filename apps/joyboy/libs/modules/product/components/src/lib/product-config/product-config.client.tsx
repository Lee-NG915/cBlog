'use client';

import { useBreakpoints } from '@castlery/fortress';
import { selectProduct, useLazyGetSwatchesByProductIdQuery } from '@castlery/modules-product-domain';
import { useSelector } from '@castlery/shared-redux-store';
import { useEffect } from 'react';

export const ProductConfigClient = (): null => {
  const { desktop } = useBreakpoints();
  const product = useSelector(selectProduct);
  const [getSwatchesByProductId, { isFetching }] = useLazyGetSwatchesByProductIdQuery();
  useEffect(() => {
    // if (desktop && product?.id) {
    if (product?.id) {
      getSwatchesByProductId(product.id);
    }
  }, [desktop, getSwatchesByProductId, product?.id]);
  return null;
};
