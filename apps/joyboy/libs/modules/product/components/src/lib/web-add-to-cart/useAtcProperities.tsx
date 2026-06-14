'use client';
import { selectVariant, selectVariantQuantity, selectProduct } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { usePrice } from '../../hooks/use-price';

export function usePhAtcProperities() {
  const currentProduct = useAppSelector(selectProduct);
  const currentVariantQty = useAppSelector(selectVariantQuantity);
  const currentVariant = useAppSelector(selectVariant);

  const { variantPrice } = usePrice({
    product: currentProduct as any,
    variant: currentVariant as any,
    isBundle: currentProduct?.product_type === 'bundle',
  });

  //   console.log('-------currentProduct', currentProduct, currentVariant, currentVariantQty);

  const properitiesProps = {
    'data-ph-capture-attribute-product-spu': currentVariant?.product_slug, //data-ph-capture-attribute-xxx
    'data-ph-capture-attribute-product-sku': currentVariant?.sku, //data-ph-capture-attribute-xxx
    'data-ph-capture-attribute-product-name': currentVariant?.product_name, //data-ph-capture-attribute-xxx
    'data-ph-capture-attribute-product-price': variantPrice,
    'data-ph-capture-attribute-product-quantity': currentVariantQty || 1,
  };

  return properitiesProps;
}
