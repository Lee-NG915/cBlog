import { ProductDyPromotionClient } from './product-dy-promotion.client';

interface ProductDyPromotionServerProps {
  promise: Promise<any>;
}

export const ProductDyPromotionServer = async (props: ProductDyPromotionServerProps) => {
  const { promise } = props;
  try {
    await promise;
    return <ProductDyPromotionClient />;
  } catch (error) {
    return null;
  }
};
