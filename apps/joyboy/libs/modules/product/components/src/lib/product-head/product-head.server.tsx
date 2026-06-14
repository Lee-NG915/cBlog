import { ProductHeadClient } from './product-head.client';
import { Box } from '@castlery/fortress';

interface ProductHeadServerProps {
  promise: Promise<any>;
}

export const ProductHeadServer = async (props: ProductHeadServerProps) => {
  const { promise } = props;
  try {
    await promise;
    return <ProductHeadClient />;
  } catch (error) {
    return <Box>product head error</Box>;
  }
};

export default ProductHeadServer;
