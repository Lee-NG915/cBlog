'use client';
import { Stack, useBreakpoints } from '@castlery/fortress';
import { CollectionHeader, CollectionContent } from './content';
import { ProductItem } from '../product-item/product-item';
import { data } from './mock';

export function ProductCollection() {
  const { desktop } = useBreakpoints();
  const products = data.hits.hits.map((hit) => hit._source);

  return (
    <Stack spacing={desktop ? 5 : 2} sx={{ mt: desktop ? '60px' : 4, px: desktop ? 0 : 3 }}>
      <CollectionHeader />
      <CollectionContent products={products}>
        {(props) => {
          const { product } = props;
          const { variants = [], life_style_image } = product || {};
          const images = life_style_image ? [life_style_image] : variants?.[0].images;
          const strikeThroughPrice = variants[0]?.price === variants[0]?.list_price ? '' : variants[0]?.list_price;

          return (
            <ProductItem
              name={props.product.name}
              description={props.product.short_description}
              price={props.product?.variants?.[0].price}
              strikeThroughPrice={strikeThroughPrice}
              images={images}
            />
          );
        }}
      </CollectionContent>
    </Stack>
  );
}

export default ProductCollection;
