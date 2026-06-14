'use client';

import { useCallback, useEffect } from 'react';
import LazyLoad from 'react-lazyload';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectShopTheInfoData } from '@castlery/modules-cms-domain';
import { TheLook } from '@castlery/modules-cms-components';
import { getShopTheLookVariant, setShopTheLookVariantData } from '@castlery/modules-product-domain';
import { CollectionRecommendation } from './components/CollectionRecommendation';

const ShopTheLookContainer = ({ type }: { type: string }) => {
  const shopTheLookData = useAppSelector(selectShopTheInfoData);
  const dispatch = useAppDispatch();
  const { desktop } = useBreakpoints();
  const getShopTheLookVariantInClient = useCallback(
    async (productIds: string[]) => {
      const result = await dispatch(getShopTheLookVariant.initiate(productIds.join(',')));
      const shopTheLookVariantData: any[] = result.data || [];
      dispatch(setShopTheLookVariantData(shopTheLookVariantData));
    },
    [dispatch]
  );
  useEffect(() => {
    if (shopTheLookData?.[type]) {
      getShopTheLookVariantInClient(
        shopTheLookData[type].map((item) => item.hotspots.map((hotspot) => hotspot.variant_id).join(','))
      );
    }
  }, [shopTheLookData]);
  if (!shopTheLookData?.[type]) {
    return null;
  }
  if (type !== 'by_collection') {
    return (
      <>
        <Stack>
          {shopTheLookData[type].map((item) => {
            return (
              <Stack sx={(theme) => ({ marginBottom: desktop ? theme.spacing(15) : theme.spacing(6) })}>
                <TheLook
                  key={item._uid}
                  imageUrl={item.image}
                  hotsPotsBlok={item.hotspots}
                  tipsBlok={item.tips}
                  lookId={item._uid}
                  variantIds={item.hotspots.map((hotspot) => hotspot.variant_id).join(',')}
                  hideAddToWishlist={true}
                />
              </Stack>
            );
          })}
        </Stack>
      </>
    );
  }
  return (
    <>
      <Stack>
        {shopTheLookData[type].map((item) => {
          return (
            <Stack sx={(theme) => ({ marginBottom: desktop ? theme.spacing(15) : theme.spacing(6) })}>
              {item?.collection_name && (
                <Typography
                  level="h2"
                  sx={(theme) => ({
                    paddingBottom: theme.spacing(5),
                    marginBottom: theme.spacing(5),
                    borderBottom: '1px solid #d9c4bb',
                    ...(!desktop && {
                      margin: `0 ${theme.spacing(4)} ${theme.spacing(5)} ${theme.spacing(4)}`,
                    }),
                  })}
                >
                  {`${item.collection_name} Looks`}
                </Typography>
              )}
              <TheLook
                key={item._uid}
                imageUrl={item.image}
                hotsPotsBlok={item.hotspots}
                tipsBlok={item.tips}
                lookId={item._uid}
                variantIds={item.hotspots.map((hotspot) => hotspot.variant_id).join(',')}
                hideAddToWishlist={true}
              />
              <Stack>
                <LazyLoad offset={300} once>
                  {item?.collection_name && <CollectionRecommendation collectionName={item.collection_name} />}
                </LazyLoad>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </>
  );
};

export { ShopTheLookContainer };
