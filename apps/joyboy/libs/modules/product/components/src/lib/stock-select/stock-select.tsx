'use client';
import { selectedRetailId, useGetStockLocationsByRetailIdQuery } from '@castlery/modules-retails-domain';
import { Select, Option, Stack, useBreakpoints, Typography, Box } from '@castlery/fortress';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import {
  Product,
  changeFulfillmentMethods,
  changeStockLocation,
  selectFulfillmentMethods,
  selectIsSelfCollection,
  selectStockLocation,
} from '@castlery/modules-product-domain';
import { useEffect, useState } from 'react';

/* eslint-disable-next-line */

interface StockLocationSelectorProps {
  productData: Product;
  onReFetchProductData?: ({
    inShowroom,
    currentStockLocation,
  }: {
    inShowroom: boolean;
    currentStockLocation: {
      id: string;
      name: string;
      location_type?: string;
      zipcode?: string;
      city?: string;
      state_text?: string;
    };
  }) => void;
}

export function StockLocationSelector({ productData, onReFetchProductData }: StockLocationSelectorProps) {
  const dispatch = useAppDispatch();
  const retailId = useAppSelector(selectedRetailId);
  const { mobile } = useBreakpoints();
  const [alreadyChanged, setAlreadyChanged] = useState(false);
  const currentStockLocation = useAppSelector(selectStockLocation);
  const isSelfCollection = useAppSelector(selectIsSelfCollection);
  const fulfillmentMethods = useAppSelector(selectFulfillmentMethods);
  const [skuIsAccessory, setSkuIsAccessory] = useState(false);
  const { currentData: stockLocations, isLoading } = useGetStockLocationsByRetailIdQuery(retailId as number, {
    skip: !retailId,
  });

  // const showroomNameList = ['SupaCenta-Stock', 'FortitudeValley-Stock', 'LiatTowers-Stock'];

  // const showroomCodeList = ['Studio-SGLT-Stock', 'Studio-AUSC-Stock', 'Studio-AUFV-Stock'];

  useEffect(() => {
    const isAccessories =
      (productData.taxons && productData.taxons.some((item) => item.permalink === 'accessories' && item.level === 1)) ||
      (productData.breadcrumbs &&
        productData.breadcrumbs.some((item) => item.permalink === 'accessories' && item.level === 1));
    setSkuIsAccessory(isAccessories);
    if (isAccessories && stockLocations && !alreadyChanged) {
      stockLocations.forEach((stockLocation) => {
        if (stockLocation?.location_type === 'stock') {
          dispatch(changeStockLocation(stockLocation));
          onReFetchProductData?.({
            inShowroom: true,
            currentStockLocation: stockLocation,
          });
          setAlreadyChanged(true);
          dispatch(changeFulfillmentMethods(true));
        }
      });
    } else if (stockLocations) {
      setAlreadyChanged(true);
      if (skuIsAccessory && !currentStockLocation?.name.toLocaleLowerCase().includes('warehouse')) {
        dispatch(changeFulfillmentMethods(true));
      } else {
        if (!alreadyChanged) {
          dispatch(changeStockLocation(stockLocations[0]));
        }
        dispatch(changeFulfillmentMethods(false));
      }
    }
    // eslint-disable-next-line
  }, [productData, stockLocations, dispatch]);

  if (isLoading || !stockLocations) {
    return null;
  }
  return (
    <Stack direction={'row'}>
      <Select
        key={Math.random()}
        sx={{
          maxWidth: mobile ? '160px' : '200px',
          minWidth: '160px',
          minHeight: '44px',
          width: '100%',
          border: (theme) => `1px solid ${theme.palette.brand.charcoal[300]} !important`,
        }}
        size="md"
        defaultValue={currentStockLocation?.id}
        onChange={(event, value) => {
          const stockLocation = stockLocations.find((stockLocation) => {
            return stockLocation.id === value;
          });
          if (stockLocation) {
            dispatch(changeStockLocation(stockLocation));
            if (!stockLocation.name.toLocaleLowerCase().includes('warehouse')) {
              onReFetchProductData?.({
                inShowroom: true,
                currentStockLocation: stockLocation,
              });
              if (skuIsAccessory) {
                dispatch(changeFulfillmentMethods(true));
              }
            } else {
              dispatch(changeFulfillmentMethods(false));
              onReFetchProductData?.({
                inShowroom: false,
                currentStockLocation: stockLocation,
              });
            }
          }
        }}
      >
        {stockLocations?.map((item) => {
          let optionName = item.name;
          if (item?.location_type === 'stock') {
            optionName = 'Showroom stock';
          } else if (item?.location_type === 'display') {
            optionName = 'Showroom display';
          }
          return (
            <Option key={item.id || 'warehouse'} value={item.id + ''}>
              {optionName}
            </Option>
          );
        })}
      </Select>
      {currentStockLocation?.support_self_collection ? (
        <Select
          key={Math.random()}
          size="md"
          sx={{
            minWidth: mobile ? '160px' : '200px',
            width: '100%',
            minHeight: '44px',
            border: (theme) => `1px solid ${theme.palette.brand.charcoal[300]} !important`,
            borderLeft: 'none !important',
          }}
          defaultValue={isSelfCollection}
          onChange={(event, value) => {
            dispatch(changeFulfillmentMethods(Boolean(value)));
          }}
        >
          {fulfillmentMethods.map(({ value, name }) => (
            <Option key={name} value={value}>
              {name}
            </Option>
          ))}
        </Select>
      ) : (
        <Box
          sx={{
            minWidth: '160px',
            width: '100%',
            border: (theme) => `1px solid ${theme.palette.brand.charcoal[300]} !important`,
            borderLeft: 'none !important',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: '16px',
              color: (theme) => theme.palette.brand.wheat[500],
            }}
          >
            Delivery
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
