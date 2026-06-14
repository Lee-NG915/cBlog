'use client';

import {
  changeVariantQuantity,
  Product,
  selectCurrentProductStockState,
  selectLeadtimeShippingFee,
} from '@castlery/modules-product-domain';
import { getBundleVariant, initializeProduct } from '@castlery/modules-product-services';
import { useAppStore, useAppSelector } from '@castlery/shared-redux-store';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useMemo } from 'react';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';
import { STOCK_STATE } from '@castlery/utils';

interface ProductReduxClientProps {
  productData: Product;
}

export const ProductReduxClient = (props: ProductReduxClientProps) => {
  const { productData } = props;
  const store = useAppStore();
  const initialized = useRef(false);
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams);
  const bundleVariant = getBundleVariant({
    productData,
    query,
  });
  const stockState = useAppSelector(selectCurrentProductStockState);
  const isOutOfStock = useMemo(() => stockState === STOCK_STATE.OUT_OF_STOCK, [stockState]);
  const leadtimeShippingFee = useAppSelector(selectLeadtimeShippingFee);

  const defaultValue = useMemo(() => {
    if (!productData) {
      return 1;
    }

    let quantity = +(query.quantity || 0);
    const min = productData.min_sale_qty;
    const max = productData.max_sale_qty;
    const inc = productData.qty_increments;

    if (min == null || max == null || inc == null) {
      return min ?? 1;
    }

    if (!(quantity && quantity >= min && quantity <= max && (quantity - min) % inc === 0)) {
      quantity = min;
    }
    return quantity;
  }, [query.quantity, productData?.min_sale_qty, productData?.max_sale_qty, productData?.qty_increments]);

  if (!initialized.current) {
    store.dispatch(initializeProduct({ product: productData, bundleVariant }));
    store.dispatch(changeVariantQuantity(defaultValue));
    initialized.current = true;
  }
  const trackingOOSPageView = async () => {
    await store.dispatch(EVENT_PDP_DETAILS({ action: 'oos_page_view' }));
  };

  useEffect(() => {
    if (leadtimeShippingFee && isOutOfStock) {
      trackingOOSPageView();
    }
  }, [store, isOutOfStock, leadtimeShippingFee, trackingOOSPageView]);

  return <></>;
};
