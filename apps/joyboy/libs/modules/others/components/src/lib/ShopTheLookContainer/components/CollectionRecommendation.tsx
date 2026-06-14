'use client';

import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';
import { ProductList, ProductItemDataProps, DYProduct, NextFortressLink } from '@castlery/shared-components';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { EcEnv } from '@castlery/config';

const CollectionRecommendation = ({ collectionName }: { collectionName: string }) => {
  const { desktop } = useBreakpoints();
  const campaign = useGetDyCampaignsQuery({
    campaignNames: ['Collection Recommendation'],
    query: {
      dyApiPreview: useSearchParams().get('dyApiPreview') || '',
    },
    realtimeFilters: {
      'Collection Recommendation': {
        realtimeRules: [
          {
            type: 'include',
            slots: [],
            query: {
              conditions: [
                {
                  field: 'collection',
                  arguments: [
                    {
                      action: 'CONTAINS',
                      value: collectionName,
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  });
  const [products, setProducts] = useState<ProductItemDataProps[]>([]);
  useEffect(() => {
    if (campaign.status === 'fulfilled' && collectionName) {
      const collectionData = campaign.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.slots;
      if (collectionData) {
        const tempProducts: ProductItemDataProps[] = [];
        collectionData.forEach((product: DYProduct) => {
          const { productData } = product;
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
            productShortDescription: '',
            spuName: productData.spu_name,
            url: productData.url,
            slotId: product.slotId,
          });
        });
        setProducts(tempProducts);
      }
    }
  }, [campaign]);
  if (products.length > 0) {
    return (
      <Stack
        sx={(theme) => ({
          mt: theme.spacing(8),
          border: `1px solid #3c101e`,
          padding: desktop ? theme.spacing(8) : theme.spacing(4),
          ...(!desktop && {
            margin: theme.spacing(6),
          }),
        })}
      >
        <Stack
          sx={(theme) => ({ mb: desktop ? theme.spacing(8) : 0 })}
          flexDirection={desktop ? 'row' : 'column'}
          justifyContent="space-between"
          alignItems={desktop ? 'flex-start' : 'center'}
        >
          <Typography
            level="h3"
            sx={(theme) => ({
              ...(!desktop && {
                mb: theme.spacing(4),
              }),
            })}
          >
            More from this collection
          </Typography>
          <NextFortressLink
            href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/collections/${collectionName?.toLocaleLowerCase()}-collection`}
          >
            View full collection
          </NextFortressLink>
        </Stack>
        <ProductList products={products} />
      </Stack>
    );
  }
  return null;
};

export { CollectionRecommendation };
