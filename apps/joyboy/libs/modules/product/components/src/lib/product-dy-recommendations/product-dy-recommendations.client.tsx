'use client';

import { selectProduct } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import LazyLoad from 'react-lazyload';
import { Box } from '@castlery/fortress';
import { ProductCollection } from '../product-recommendations/components/product-collection';
import { TemplateDiversion } from '@castlery/shared-components';

export const ProductDyRecommendationsClient = () => {
  const product = useAppSelector(selectProduct);
  return (
    <div data-section="dy-recommendations">
      <LazyLoad offset={300} once placeholder={<Box sx={{ height: { xs: '470px', sm: '486px', md: '592px' } }} />}>
        <TemplateDiversion
          selector_name="PDP Recommendation API #2"
          fallbackWidget={
            (product?.cross_sell?.length ?? 0) > 0 &&
            (product?.collections?.length ?? 0) > 0 &&
            product?.collections ? (
              <ProductCollection title="Goes Well With" collectionIds={product.collections} />
            ) : (
              <></>
            )
          }
          containerSx={{
            pt: { xs: 7, md: 8 },
          }}
        />
      </LazyLoad>
      <LazyLoad offset={300} once placeholder={<Box sx={{ height: { xs: '470px', sm: '486px', md: '592px' } }} />}>
        <TemplateDiversion
          selector_name="PDP Recommendation API #3"
          containerSx={{
            pt: { xs: 7, md: 8 },
          }}
        />
      </LazyLoad>
    </div>
  );
};
