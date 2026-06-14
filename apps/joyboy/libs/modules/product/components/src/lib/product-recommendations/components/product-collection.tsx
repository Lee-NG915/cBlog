'use client';

import { EcEnv } from '@castlery/config';
import { Loading, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { useGetProductCollectionsQuery } from '@castlery/modules-product-domain';
import { ProductItemDataProps, ProductList } from '@castlery/shared-components';
import { useMemo } from 'react';
// import { ProductItemDataProps, ProductList } from '../../recommendation-carousel';

interface ProductCollectionProps {
  title?: string;
  collectionIds: number[];
}

export const ProductCollection = (props: ProductCollectionProps) => {
  const { title, collectionIds } = props;
  const { desktop, mobile } = useBreakpoints();
  //TODO  es 接口错误时需要错误 modal
  const { data: collectionProducts, isLoading } = useGetProductCollectionsQuery(
    { collections: collectionIds },
    { skip: collectionIds.length === 0 }
  );

  const sortedCollectionProducts = useMemo(() => {
    const sortedProducts = collectionProducts?.hits?.hits
      ? [...collectionProducts.hits.hits]
          .sort((a, b) => collectionIds?.indexOf(a?._source?.id) - collectionIds?.indexOf(b?._source?.id))
          .map((h) => h?._source)
      : [];
    const tempProducts: ProductItemDataProps[] = [];
    sortedProducts?.forEach((product) => {
      const variant = product?.variants?.[0];
      tempProducts.push({
        sku: variant?.sku,
        badges: variant?.badges,
        images: {
          base: variant?.images?.[0]?.feed,
          lifestyle: variant?.life_style_image?.feed,
        },
        variantId: variant?.id?.toString(),
        inStock: variant?.in_stock_regions?.length > 0,
        name: variant?.name,
        price: Number(variant?.list_price),
        salePrice: variant?.price,
        productShortDescription: variant?.product_short_description,
        spuName: product?.name,
        url: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/products/${product?.slug}`,
      });
    });
    return tempProducts?.filter((item) => item?.variantId);
  }, [collectionProducts, collectionIds]);

  if (collectionIds.length === 0 || sortedCollectionProducts.length === 0) return null;

  return (
    <Stack px={desktop ? 7 : 6} py={mobile ? 7 : 8}>
      {isLoading ? (
        <Loading
          theme="dark"
          size="lg"
          sx={{
            width: '100%',
            height: 20,
          }}
        />
      ) : (
        <>
          <Typography
            level="h2"
            sx={{
              mb: desktop ? 8 : 4,
            }}
          >
            {title}
          </Typography>
          <ProductList
            openHover={false}
            imageType={'base_image'}
            products={sortedCollectionProducts}
            needSliderDisplay={true}
            applyATCAndWishlist={true}
          />
        </>
      )}
    </Stack>
  );
};
