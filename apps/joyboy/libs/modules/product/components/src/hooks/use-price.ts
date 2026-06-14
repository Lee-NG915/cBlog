import { BundleVariants, getPriceByVariant, Product, toPrice, Variant } from '@castlery/modules-product-domain';
import { useMemo } from 'react';

interface UsePriceProps {
  product?: Product;
  variant?: Variant;
  bundleVariant?: BundleVariants;
  isBundle?: boolean;
}

/**
 * 处理 product 接口相关价格
 * @param props
 * @returns
 * variantListPrice: 划线价 @jasper
 * currency.js 格式化价钱,参考utils/toPrice todo：@jasper
 */
export const usePrice = (props: UsePriceProps) => {
  const { product, variant, bundleVariant } = props;
  const minSaleQty = product?.min_sale_qty || 0;

  return useMemo(() => {
    if (product?.product_type !== 'bundle') {
      const currentVariantPrice = getPriceByVariant(variant?.price || '', minSaleQty, true);
      const currentVariantListPrice = getPriceByVariant(variant?.list_price || '', minSaleQty, true);
      const currentVariantSinglePrice = toPrice(variant?.list_price, true);
      return {
        variantPrice: currentVariantPrice,
        variantListPrice: currentVariantListPrice,
        singlePrice: currentVariantSinglePrice,
        numberVariantPrice: Number(variant?.price) * minSaleQty,
        numberVariantListPrice: Number(variant?.list_price) * minSaleQty,
        numberVariantSinglePrice: Number(variant?.list_price),
      };
    } else {
      if (product?.bundle_options && bundleVariant) {
        const { bundle_options } = bundleVariant;
        let tempPrice = Number(variant?.price) || 0;
        let tempListPrice = Number(variant?.list_price) || 0;
        bundle_options?.forEach((item) => {
          product?.bundle_options?.forEach((option) => {
            if (item?.bundle_option_id === `${option.id}`) {
              option?.variants?.forEach((subVariant) => {
                if (subVariant?.id === item?.bundle_option_variant_id) {
                  tempPrice += Number(subVariant.price_modifier || 0) * option?.default_quantity;
                  tempListPrice += Number(subVariant?.price_modifier || 0) * option?.default_quantity;
                }
              });
            }
          });
        });
        return {
          variantPrice: toPrice(tempPrice + '', true),
          variantListPrice: toPrice(tempListPrice + '', true),
          singlePrice: toPrice(tempListPrice + '', true),
          numberVariantPrice: tempPrice,
          numberVariantListPrice: tempListPrice,
          numberVariantSinglePrice: tempListPrice,
        };
      } else {
        return {
          variantPrice: '',
          variantListPrice: '',
          singlePrice: '',
        };
      }
    }
  }, [bundleVariant, minSaleQty, product?.bundle_options, product?.product_type, variant?.list_price, variant?.price]);
};
