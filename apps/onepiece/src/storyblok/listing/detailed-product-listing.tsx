import React from 'react';
import { Stack } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react';
import StoryblokProduct from 'components/Product/StoryblokProduct';
import { useProductLoader } from '../hooks/product';

type DetailedProductListingProps = {
  blok: {
    _uid?: string;
    product_id?: string;
  };
};

type DetailedProductComponentProps = {
  blok: DetailedProductListingProps;
  productInfo: object;
};

export const DetailedProductComponent = ({ blok, productInfo }: DetailedProductComponentProps) => (
  <Stack
    {...storyblokEditable(blok)}
    key={blok._uid}
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
    <StoryblokProduct blok={blok} product={productInfo} type="detail" />
  </Stack>
);

function DetailedProductListing({ blok }: DetailedProductListingProps) {
  const { product_id } = blok || {};
  const { products, loaded } = useProductLoader(product_id);

  if (!loaded) {
    return null;
  }

  return <DetailedProductComponent blok={blok} productInfo={products[0]} />;
}

export { DetailedProductListing };
