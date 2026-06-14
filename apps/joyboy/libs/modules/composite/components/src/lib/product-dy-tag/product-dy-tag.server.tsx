import { DYResourceTag } from '@castlery/modules-dy-components';
import { DYPageTypes } from '@castlery/modules-dy-domain';
import { ProductDyTagClient } from './product-dy-tag.client';

interface ProductDyTagServerProps {
  promise: Promise<any>;
}

export async function ProductDyTagServer({ promise }: ProductDyTagServerProps) {
  try {
    const productData = await promise;
    const variant = productData?.variants[0];
    return (
      <>
        <DYResourceTag
          recommendationContext={{
            type: DYPageTypes.PRODUCT,
            data: [variant?.sku || ''],
          }}
        />
        <ProductDyTagClient />
      </>
    );
  } catch (e) {
    return null;
  }
}
