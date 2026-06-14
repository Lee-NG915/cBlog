import { Stack, Typography } from '@castlery/fortress';
// import { ProductItem } from '../product-item/product-item';

interface ProductsRecommendationProps {
  products: any[];
}
export function ProductsRecommendation({ products }: ProductsRecommendationProps) {
  if (!products || !Array.isArray(products) || products.length === 0) return null;

  return (
    <Stack>
      <Typography level="h3">Mid-Year Storewide Sale: Up to $400 Off</Typography>
    </Stack>
  );
}

export default ProductsRecommendation;
