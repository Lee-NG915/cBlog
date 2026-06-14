'use client';

import { useSelector } from 'react-redux';
import { JsonLd } from '@castlery/seo';
import { useAppSelector } from '@castlery/shared-redux-store';
import {
  LeadTimeShippingFee,
  selectBundleVariants,
  selectCurrentProductStockState,
  selectLeadtimeShippingFee,
  selectProduct,
  selectVariant,
} from '@castlery/modules-product-domain';
import { usePrice } from '@castlery/modules-product-components';
import { useProductBreadcrumbs } from '@castlery/shared-components';
import { STOCK_STATE } from '@castlery/utils';
import { useMemo } from 'react';
import { generateProductSchema, generateProductUrl } from './product-schema.utils';
import { generateRatingObject, generateReviewsArray } from '@castlery/seo';
import { getBundleVariantLink, getVariantLink } from '@castlery/modules-product-services';
import { logger } from '@castlery/observability/client';

interface ProductSchemaClientProps {
  product?: any;
  variant?: any;
  bundleVariant?: any;
  leadTimeShippingFee?: LeadTimeShippingFee;
  defaultStockState?: string;
}

export function ProductSchemaClient(props: ProductSchemaClientProps) {
  const { product: productProp, variant: variantProp, bundleVariant: bundleVariantProp, leadTimeShippingFee } = props;
  const productFromStore = useAppSelector(selectProduct);
  const variantFromStore = useSelector(selectVariant);
  const bundleVariantFromStore = useSelector(selectBundleVariants);

  const product = productProp || productFromStore;
  const variant = variantProp || variantFromStore;
  const bundleVariant = bundleVariantProp || bundleVariantFromStore;
  const { numberVariantPrice = 0 } = usePrice({ product, variant, bundleVariant });
  const productBreadcrumbs = useProductBreadcrumbs(undefined, product);
  const reduxStockState = useAppSelector(selectLeadtimeShippingFee);
  const compositeStockState = useAppSelector(selectCurrentProductStockState);

  const stockState = useMemo(() => {
    if (reduxStockState && compositeStockState) {
      return compositeStockState;
    } else {
      return leadTimeShippingFee?.stock_state || STOCK_STATE.IN_STOCK;
    }
  }, [leadTimeShippingFee, reduxStockState, compositeStockState]);

  const isOutOfStock = useMemo(() => {
    return stockState === STOCK_STATE.OUT_OF_STOCK;
  }, [stockState]);

  const originUrl = useMemo(() => {
    if (!product || !variant) return '';
    return generateProductUrl(product, variant, bundleVariant);
  }, [product, variant, bundleVariant]);

  const schema = useMemo(() => {
    if (!product || !variant) {
      return null;
    }

    // 转换 breadcrumbs 格式以匹配工具函数的接口
    const breadcrumbs =
      productBreadcrumbs?.map((crumb) => ({
        name: crumb.name,
        url: crumb.url,
      })) || [];

    return generateProductSchema({
      product,
      variant,
      bundleVariant,
      numberVariantPrice,
      productBreadcrumbs: breadcrumbs,
      isOutOfStock,
      originUrl,
    });
  }, [product, variant, bundleVariant, numberVariantPrice, productBreadcrumbs, isOutOfStock, originUrl]);

  if (!schema) return null;

  return (
    <>
      {schema.map((item, index) => (
        <JsonLd key={index} code={item} />
      ))}
    </>
  );
}
