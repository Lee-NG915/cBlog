'use client';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { HorizontalScrollBox, horizontalScrollBoxClasses } from '@castlery/shared-components';
import { removeClPicBgColor } from '@castlery/utils';
import { ProductRecommendationItem } from '../product-recommendation-item/product-recommendation-item';
import { useAppSelector } from '@castlery/shared-redux-store';

import { selectMiniCartMode } from '@castlery/modules-cart-domain';

/**
 * pure ui component
 * @typedef {Object} ProductsRecommendationsProps
 * @property {string} title
 * @property {any[]} products
 */
interface ProductsRecommendationsProps {
  title: string;
  products: any[];
}
export function ProductsRecommendations({ title, products }: ProductsRecommendationsProps) {
  const { desktop, mobile } = useBreakpoints();
  const inMiniCart = useAppSelector(selectMiniCartMode);

  const recProducts = Array.isArray(products)
    ? products.map((item) => {
        const product = item.productData || {};
        let price = product.dy_display_price || product.sale_price;
        let strikeThroughPrice = '';
        if (product.sale_price && product.dy_display_price) {
          price = product.sale_price;
          strikeThroughPrice = product.dy_display_price;
        }

        return {
          id: item.sku,
          sku: item.sku,
          name: product.spu_name,
          description: product.option_value_material, // TODO @abbbywang23 waitiing for the new field(option_values) from Dy product feed
          price,
          strikeThroughPrice,
          images: product.image_url ? [{ feed: removeClPicBgColor(product.image_url), alt: product.spu_name }] : [],
          tag: product.badges?.includes(',') ? product.badges.split(',')[0] : product.badges,
          rawData: item,
          url: product.url,
        };
      })
    : [];
  if (recProducts.length === 0) return null;

  return (
    <Stack
      sx={{
        rowGap: desktop && !inMiniCart ? 8 : 6,
        [`& .${horizontalScrollBoxClasses.container}`]: {
          columnGap: desktop && !inMiniCart ? 10 : 2,
        },
      }}
    >
      <Typography level={mobile ? 'h1' : 'h2'}>{title}</Typography>
      <HorizontalScrollBox>
        {recProducts.map((product) => (
          <Stack key={product.id}>
            <ProductRecommendationItem {...product} />
          </Stack>
        ))}
      </HorizontalScrollBox>
    </Stack>
  );
}
