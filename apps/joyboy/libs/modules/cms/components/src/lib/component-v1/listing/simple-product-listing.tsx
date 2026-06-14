'use client';

import React from 'react';
import { storyblokEditable } from '@storyblok/react/rsc';
import { ProductItem } from '@castlery/modules-product-components';
import { DtStack } from '@castlery/modules-tracking-components';
import { useGetProductCollectionsQuery } from '@castlery/modules-product-domain';
import { SimpleProductListingStoryblok } from '@castlery/types';

type SimpleProductComponentProps = {
  blok: SimpleProductListingStoryblok;
  productInfo: {
    price: number;
    name: string;
  };
};

export const SimpleProductComponent = ({ blok, productInfo }: SimpleProductComponentProps) => {
  if (JSON.stringify(productInfo) === '{}') {
    return null;
  }
  const strikeThroughPrice =
    productInfo.variants[0]?.price === productInfo.variants[0]?.list_price ? '' : productInfo.variants[0]?.list_price;
  const images = productInfo.variants[0]?.images;
  const lifestyle_images = productInfo.variants[0]?.life_style_image || undefined;
  const colorOptions = productInfo.variants
    .map((v) => v.option_values.material || v.option_values.color_option || v.option_values.wood)
    .filter(Boolean);

  return (
    <DtStack
      useImpression
      {...storyblokEditable(blok)}
      uid={blok._uid}
      key={blok._uid}
      componentName="simple-product-listing"
      direction="column"
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        border: '1px solid transparent',
        transition: 'border-color 0.3s ease-in-out',
        '@media (hover: hover) ': {
          '&:hover': {
            borderColor: theme.palette.brand.wheat[500],
          },
        },
      })}
    >
      <ProductItem
        name={productInfo.name}
        description={productInfo.variants[0].product_short_description}
        price={productInfo.variants[0].price}
        strikeThroughPrice={strikeThroughPrice}
        images={images}
        lifestyle_images={[lifestyle_images]}
        fromStoryblok={true}
      />
    </DtStack>
  );
};

function SimpleProductListing({ blok }: SimpleProductListingStoryblok) {
  const { product_id } = blok || {};
  const collections = [Number(product_id)];
  const { products } = useGetProductCollectionsQuery(
    {
      collections,
    },
    {
      skip: !collections.length,
      selectFromResult: ({ data }) => ({
        products: data?.hits.hits.map((item) => item._source),
      }),
    }
  );
  const productInfo = products?.find((item) => Number(item.id) === Number(product_id));
  if (!productInfo) return;

  return <SimpleProductComponent blok={blok} productInfo={productInfo} />;
}

export { SimpleProductListing };
