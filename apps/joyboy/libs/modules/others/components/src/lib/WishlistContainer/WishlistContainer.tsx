'use client';

import { EcEnv } from '@castlery/config';
import { Container, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { getVariantsByIds } from '@castlery/modules-product-domain';
import { selectedWishList } from '@castlery/modules-user-domain';
import { GeneralBreadcrumbs } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useEffect, useState } from 'react';
import { EmptyWishlist } from './components/EmptyWishlist';
import { Wishlist } from './components/Wishlist';

interface ProductItemDataProps {
  sku: string;
  badges: string[];
  images: {
    base: string;
    lifestyle?: string;
  };
  inStock: boolean;
  name: string;
  price: number;
  salePrice: string;
  productShortDescription: string;
  spuName: string;
  url: string;
  variantId: string;
  productType: 'configurable' | 'bundle';
}

interface WishListDataItemProps {
  available_quantity: number;
  badges: string[];
  id: number;
  images: {
    id: number;
    links: {
      feed: string;
    };
  }[];
  is_customized: boolean;
  lead_time: number;
  list_price: string;
  max_sale_qty: number;
  min_sale_qty: number;
  name: string;
  price: string;
  product_name: string;
  product_id: number;
  product_type: 'configurable' | 'bundle';
  product_slug: string;
  product_short_description: string;
  sku: string;
}

// const mockWishListData = [
//   { id: 27425 },
//   { id: 33174 },
//   { id: 31969 },
//   { id: 32952 },
//   { id: 32671 },
//   { id: 31539 },
//   { id: 27446 },
//   { id: 5638 },
// ];

const WishlistContainer = () => {
  const { desktop } = useBreakpoints();
  const dispatch = useAppDispatch();
  const currentWishListData = useAppSelector(selectedWishList);
  // const currentWishListData = mockWishListData;
  const [wishListData, setWishListData] = useState<ProductItemDataProps[]>([]);
  const [fakeWishListData, setFakeWishListData] = useState<ProductItemDataProps[]>([]);

  const decorateUrl = (url: string, optionValues: { option_type_name: string; name: string }[]) => {
    if (optionValues.length > 0) {
      const optionValuesString = optionValues.map((item) => `${item.option_type_name}=${item.name}`).join('&');
      return `${url}?${optionValuesString}`;
    }
    return url;
  };

  const getWishListDataDetail = async () => {
    const result = await dispatch(
      getVariantsByIds.initiate(currentWishListData.map((item) => item.id.toString()).join(','))
    );
    if (result.status === 'fulfilled') {
      const tempData: ProductItemDataProps[] = [];
      result.data.forEach((item) => {
        tempData.push({
          sku: item.sku,
          badges: item.badges,
          images: {
            base: item.images?.[0]?.links?.feed,
          },
          inStock: item.available_quantity > 0,
          name: item.name,
          price: item.list_price,
          salePrice: item.price,
          productShortDescription: item.variant_option_values
            .map((option: { presentation: string }) => option.presentation)
            .join(', '),
          spuName: item.product_name,
          url: decorateUrl(
            `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/products/${
              item.product_slug
            }`,
            item.variant_option_values
          ),
          productType: item.product_type,
          variantId: item.id.toString(),
        });
      });
      setWishListData(tempData);
      setFakeWishListData(tempData);
    }
  };
  useEffect(() => {
    if (currentWishListData.length > 0) {
      getWishListDataDetail();
    }
  }, [currentWishListData]);

  const handleTempRemoveWishlist = ({ id, name }: { id: number; name: string }) => {
    setFakeWishListData(fakeWishListData.filter((item) => item.variantId !== id.toString()));
  };

  const handleTempRemoveRollback = () => {
    setFakeWishListData(wishListData);
  };

  return (
    <Container sx={{ ...(!desktop && { padding: '0 !important' }) }}>
      <Stack>
        <GeneralBreadcrumbs
          breadcrumbs={[
            {
              label: 'Products Wishlist',
              link: '/wishlist',
            },
          ]}
        />
        <Stack
          sx={(theme) => ({
            paddingTop: {
              xs: theme.spacing(4),
              sm: theme.spacing(8),
            },
            paddingBottom: {
              xs: theme.spacing(8),
              sm: 0,
            },
            alignItems: 'center',
            mb: {
              xs: 0,
              sm: theme.spacing(10),
            },
          })}
        >
          <Typography level="h1">Wishlist</Typography>
        </Stack>
        {wishListData.length === 0 ? <EmptyWishlist /> : <></>}
        {wishListData.length > 0 && (
          <Wishlist
            wishListData={fakeWishListData}
            onTempRemoveWishlist={handleTempRemoveWishlist}
            onTempRemoveRollback={handleTempRemoveRollback}
          />
        )}
      </Stack>
    </Container>
  );
};

export { WishlistContainer };
