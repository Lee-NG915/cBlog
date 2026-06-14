/* eslint-disable @typescript-eslint/no-unused-vars */
// import { getProductByIdOrSlugThunk } from '@castlery/modules-product-domain';
// import { makeStore } from '@castlery/shared-redux-store';
// import { ProductReviewsClient } from './components/product-reviews.client';
import dynamic from 'next/dynamic';
const ProductReviewsClient = dynamic(() => import('./product-reviews.client').then((mod) => mod.ProductReviewsClient), {
  ssr: false,
});

export interface ProductReviewsProps {
  promise: Promise<any>;
}

export async function ProductReviews(props: ProductReviewsProps) {
  const { promise } = props;
  try {
    const productData = await promise;
    if (productData?.reviews?.total_count > 0) {
      return <ProductReviewsClient />;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default ProductReviews;
