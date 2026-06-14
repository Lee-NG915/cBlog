import { productCollectionPreload } from '@castlery/modules-product-services/server';
import { ProductInfoClient } from './product-info.client';
import { ProductCollectionSectionServer } from './components/product-collection-section/product-collection-section.server';
import { Suspense } from 'react';
import { ProductCollectionSectionLoading } from './components/product-collection-section/loading';

interface ProductInfoServerProps {
  promise: Promise<any>;
  pageType: 'pdp' | 'pla';
}

export const ProductInfoServer = async (props: ProductInfoServerProps) => {
  const { promise, pageType } = props;
  try {
    productCollectionPreload();
    const product = await promise;
    return (
      <ProductInfoClient pageType={pageType}>
        <Suspense fallback={<ProductCollectionSectionLoading />}>
          <ProductCollectionSectionServer product={product} />
        </Suspense>
      </ProductInfoClient>
    );
  } catch (error) {
    return null;
  }
};
