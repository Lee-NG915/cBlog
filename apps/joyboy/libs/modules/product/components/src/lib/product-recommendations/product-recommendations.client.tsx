'use client';

import { selectProduct } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import LazyLoad from 'react-lazyload';
import { ProductCollection } from './components/product-collection';
import { Box, useBreakpoints } from '@castlery/fortress';
import { StcRecommendationCarousel, DYRecommendationCarousel } from '@castlery/shared-components';
import { Product, Taxon } from '@castlery/modules-product-domain';
import { useState, useEffect } from 'react';

export const ProductRecommendationsClient = () => {
  const product = useAppSelector(selectProduct);
  const [collectionNames, setCollectionNames] = useState<{
    collection1: string | undefined;
    collection2: string | undefined;
    collection3: string | undefined;
  }>();
  useEffect(() => {
    if (product) {
      const { taxons } = product as Product;
      const tempArr: string[] = [];
      taxons?.forEach((taxon: Taxon) => {
        if (taxon.ancestors.length > 0 && taxon.ancestors[0] === 'Collections' && !tempArr.includes(taxon.name)) {
          tempArr.push(taxon.name);
        }
      });
      setCollectionNames({
        collection1: tempArr[0] || undefined,
        collection2: tempArr[1] || undefined,
        collection3: tempArr[2] || undefined,
      });
    }
  }, [product]);

  const { mobile, tablet } = useBreakpoints();
  return (
    <>
      {product && product?.collections?.length > 0 && (
        <LazyLoad
          offset={300}
          once
          placeholder={<Box sx={{ height: mobile ? '470px' : tablet ? '486px' : '592px' }} />}
        >
          <StcRecommendationCarousel
            selector_names={['Shop The Collection', 'Shop The Collection Fallback']}
            customPageAttributes={{
              collection1: collectionNames?.collection1 || 'undefined',
              collection2: collectionNames?.collection2 || 'undefined',
              collection3: collectionNames?.collection3 || 'undefined',
            }}
            fallbackWidget={<ProductCollection title="Shop the collection" collectionIds={product?.collections} />}
          />
        </LazyLoad>
      )}
    </>
  );
};
