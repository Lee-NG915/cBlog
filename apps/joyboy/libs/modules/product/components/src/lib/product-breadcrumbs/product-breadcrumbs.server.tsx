import { Box } from '@castlery/fortress';
import { ProductBreadcrumbsClient } from './product-breadcrumbs.client';

export interface ProductBreadcrumbsServerProps {
  promise: Promise<any>;
}

export const ProductBreadcrumbsServer = async (props: ProductBreadcrumbsServerProps) => {
  const { promise } = props;
  try {
    await promise;
    return <ProductBreadcrumbsClient />;
  } catch (error) {
    return <Box>breadcrumbs error</Box>;
  }
};

export default ProductBreadcrumbsServer;
