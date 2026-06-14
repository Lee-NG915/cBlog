'use client';

import { Loading, Stack, Typography } from '@castlery/fortress';
import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import { formatCampaignsResponse } from '@castlery/utils';
import { useMemo } from 'react';
import { DYProduct, ProductItemDataProps, ProductList } from '@castlery/shared-components';

interface ProductFabricCollectionsProps {
  title: string;
  materialType: string;
}

export const ProductFabricCollections = (props: ProductFabricCollectionsProps) => {
  const { title, materialType } = props;
  const queryParams = useMemo(() => {
    return {
      campaignNames: ['Customized Recommendation'],
      customPageAttributes: {
        material: materialType,
      },
    };
  }, [materialType]);

  const { data: campaignsData, isLoading } = useGetDyCampaignsQuery(queryParams, {
    skip: !materialType,
  });

  const dyProducts = useMemo(() => {
    if (campaignsData?.choices) {
      const formatData = formatCampaignsResponse(campaignsData.choices);
      if (formatData['Customized Recommendation']?.hitVariation?.slots) {
        const products = formatData['Customized Recommendation']?.hitVariation?.slots;
        const groupIds: string[] = [];
        const tempProducts: ProductItemDataProps[] = [];
        products.forEach((product: DYProduct) => {
          const { productData } = product;
          if (!groupIds.includes(productData.group_id)) {
            groupIds.push(productData.group_id);
            tempProducts.push({
              sku: product.sku,
              badges: productData.badges.split(','),
              images: {
                base: productData.image_url,
                lifestyle: productData.lifestyle_image,
              },
              variantId: productData.variant_id,
              inStock: productData.in_stock,
              name: productData.name,
              price: productData.price,
              salePrice: productData.sale_price,
              productShortDescription: productData.product_short_description,
              spuName: productData.spu_name,
              url: productData.url,
            });
          }
        });
        return tempProducts;
      }
    }
    return [];
  }, [campaignsData]);

  if (dyProducts.length === 0) return null;

  return (
    <Stack>
      {isLoading ? (
        <Loading
          theme="light"
          sx={{
            width: '100%',
            height: 20,
          }}
        />
      ) : (
        <>
          <Typography
            level="h4"
            sx={{
              mb: 4,
            }}
          >
            {title}
          </Typography>
          <ProductList products={dyProducts} />
        </>
      )}
    </Stack>
  );
};
