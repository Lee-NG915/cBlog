'use client';
import { ListWrapper } from './list-wrapper';
import { ProductItem } from '../product-item/product-item';
import type { HitSub } from '@castlery/modules-product-domain';
import { ListItemButton } from '@castlery/fortress';
import { useParams, usePathname } from 'next/navigation';
import { createDataTrackingData } from '@castlery/utils';
import { EcEnv } from '@castlery/config';

interface ProductsListProps {
  products: HitSub['_source'][];
  outerModuleName?: string;
}

export function ProductsList({ products, outerModuleName = '' }: ProductsListProps) {
  const pathname = usePathname();
  const { region } = useParams();

  const trackingTags = (productName: string, index: number) =>
    createDataTrackingData({
      pathname,
      module: outerModuleName,
      elementName: 'Product Item',
      content: {
        target: productName,
        index,
      },
    });
  return (
    <ListWrapper products={products}>
      {(props) => {
        const { product, index } = props;
        const { variants = [], life_style_image, slug } = product || {};
        const images = life_style_image ? [life_style_image] : variants?.[0].images;
        const strikeThroughPrice = variants[0]?.price === variants[0]?.list_price ? '' : variants[0]?.list_price;

        return (
          <ListItemButton
            component="a"
            {...trackingTags(product?.name, index)}
            href={`${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${region}/products/${slug}`}
            sx={{ p: 0, m: 0 }}
          >
            <ProductItem
              name={props.product.name}
              description={props.product?.variants?.[0].product_short_description}
              price={props.product?.variants?.[0].price}
              strikeThroughPrice={strikeThroughPrice}
              images={images}
            />
          </ListItemButton>
        );
      }}
    </ListWrapper>
  );
}

export default ProductsList;
