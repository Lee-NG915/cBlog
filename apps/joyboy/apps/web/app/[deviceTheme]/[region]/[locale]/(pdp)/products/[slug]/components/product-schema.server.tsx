import { getWebLeadTimeShippingFee, LeadTimeShippingFeeReq } from '@castlery/modules-product-domain';
import { getBundleVariant } from '@castlery/modules-product-services';
import { logger } from '@castlery/observability/server';
import { makeStore } from '@castlery/shared-redux-store';
import { ProductSchemaClient } from './product-schema.client';
import { accessInUS } from '@castlery/config';
import { STOCK_STATE } from '@castlery/utils';
import { JsonLd } from '@castlery/seo';
import {
  calculateProductPrice,
  generateProductBreadcrumbs,
  generateProductSchema,
  generateProductUrl,
} from './product-schema.utils';

interface ProductSchemaServerProps {
  promise: Promise<any>;
  cityInfo: {
    zipcode?: string;
    city?: string;
    state?: string;
  };
  searchParams: {
    [key: string]: string;
  };
}

export const ProductSchemaServer = async (props: ProductSchemaServerProps) => {
  const { promise, cityInfo, searchParams } = props;
  const leadTimeFlag = accessInUS && searchParams.region_id;

  try {
    const product = await promise;
    if (!product) {
      return null;
    }

    const variant = product.variants?.[0];
    let bundleVariant: any = undefined;

    if (product?.product_type === 'bundle') {
      bundleVariant = getBundleVariant({
        productData: product,
        query: searchParams,
      });
    }

    const numberVariantPrice = calculateProductPrice(product, variant, bundleVariant);
    const productBreadcrumbs = generateProductBreadcrumbs(product);
    const originUrl = generateProductUrl(product, variant, bundleVariant);

    let stockState = STOCK_STATE.IN_STOCK;
    let isOutOfStock = false;

    if (leadTimeFlag) {
      try {
        const store = makeStore();
        let params: LeadTimeShippingFeeReq;
        if (product?.product_type === 'bundle') {
          if (!bundleVariant?.variant_id) {
            throw new Error('Bundle variant not found');
          }
          params = {
            quantity: product?.qty_increments || 1,
            variant_id: bundleVariant.variant_id,
            options: {
              bundle_options: bundleVariant.bundle_options,
            },
          };
        } else {
          if (!variant?.id) {
            throw new Error('Product variant not found');
          }
          params = {
            quantity: product?.qty_increments || 1,
            variant_id: variant.id,
          };
        }
        params = {
          ...params,
          ...(cityInfo && {
            zipcode: cityInfo?.zipcode,
            city: cityInfo?.city,
            state: cityInfo?.state,
          }),
        };
        const leadTimeData = await store.dispatch(getWebLeadTimeShippingFee.initiate(params)).unwrap();
        stockState = leadTimeData?.stock_state || STOCK_STATE.IN_STOCK;
        isOutOfStock = stockState === STOCK_STATE.OUT_OF_STOCK;
      } catch (error) {
        logger.error('Failed to get lead time data', { error });
        stockState = STOCK_STATE.OUT_OF_STOCK;
        isOutOfStock = true;
      }
    }

    const schema = generateProductSchema({
      product,
      variant,
      bundleVariant,
      numberVariantPrice,
      productBreadcrumbs,
      isOutOfStock,
      originUrl,
    });

    if (!schema) {
      return null;
    }

    return (
      <>
        {schema.map((item, index) => (
          <JsonLd key={index} code={item} />
        ))}
      </>
    );
  } catch (error) {
    logger.error('Failed to get product schema', { error });
    return <ProductSchemaClient defaultStockState={STOCK_STATE.OUT_OF_STOCK} />;
  }
};
