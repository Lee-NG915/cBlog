'use client';
import {
  ProductItemDataProps as ProductItemDataPropsV1,
  SingleProductItem as SingleProductItemV1,
} from './product-item';
import { ProductItemDataPropsV2, SingleProductItemV2 } from './product-item-v2';
import { sharedFeatureService } from '@castlery/shared-services';

const enableOrderV2 = sharedFeatureService.enabledOrderV2;

export const ProductItem = (props: ProductItemDataProps | ProductItemDataPropsV2) => {
  if (enableOrderV2) {
    // @ts-ignore
    return <SingleProductItemV2 {...(props as ProductItemDataPropsV2)} />;
  }
  // @ts-ignore
  return <SingleProductItemV1 {...(props as ProductItemDataPropsV1)} />;
};

export type ProductItemDataProps = ProductItemDataPropsV1 | ProductItemDataPropsV2;
