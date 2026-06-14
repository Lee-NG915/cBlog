'use client';

import { EcEnv, enableDisplayProductShipping, enableWarehouseFrom } from '@castlery/config';
import { Box, Divider, Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowForwardIos, Shipping } from '@castlery/fortress/Icons';
import { LeadTimeShippingFee } from '@castlery/modules-product-domain';
import { trackingFeatureService, EVENT_SHIPPING_SELECTOR } from '@castlery/modules-tracking-services';
import { selectedCurrentCityInfo } from '@castlery/modules-user-domain';
import { ShippingLocationModal } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { STOCK_STATE } from '@castlery/utils';
import { useMemo, useState } from 'react';

interface ProductShippingInfoProps {
  stockState: string;
  warehouseName: string;
  finalSlug: string;
  leadTimeShippingFee?: LeadTimeShippingFee;
}

const deliveryInfo = {
  US: {
    name: 'Delivery - Calculated per shipment',
    id: 'pdp-shipping-usp',
  },
  SG: {
    name: '',
    id: '',
  },
  AU: {
    name: 'Delivery - Calculated per shipment',
    id: 'pdp-shipping-usp',
  },
  CA: {
    name: 'Delivery - Calculated per shipment',
    id: 'pdp-shipping-usp',
  },
  UK: {
    name: 'Delivery - Calculated per shipment',
    id: 'pdp-shipping-usp',
  },
};

export const ProductShippingInfo = (props: ProductShippingInfoProps) => {
  const { stockState, warehouseName, finalSlug, leadTimeShippingFee } = props;
  const currentCityInfo = useAppSelector(selectedCurrentCityInfo);
  const dispatch = useAppDispatch();
  const { mobile } = useBreakpoints();
  const [openShippingLocationModal, setOpenShippingLocationModal] = useState(false);
  const displayShippingInfo = useMemo(
    () => stockState !== STOCK_STATE.OUT_OF_STOCK && warehouseName && enableWarehouseFrom,
    [stockState, warehouseName]
  );
  if (!enableDisplayProductShipping && !displayShippingInfo) return null;

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" py={4}>
        <Stack direction="row" alignItems="flex-start" gap={2} flex={1}>
          {(deliveryInfo[EcEnv.NEXT_PUBLIC_COUNTRY]?.name || displayShippingInfo) && (
            <Box
              sx={{
                color: 'var(--fortress-palette-brand-mono-900)',
              }}
            >
              <Shipping />
            </Box>
          )}
          <Stack gap={1} alignItems="flex-start" mt={'1px'}>
            {deliveryInfo[EcEnv.NEXT_PUBLIC_COUNTRY]?.name && (
              <Typography
                level="h5"
                sx={{
                  color: 'var(--fortress-palette-brand-maroonVelvet-500)',
                }}
              >
                {deliveryInfo[EcEnv.NEXT_PUBLIC_COUNTRY]?.name}
              </Typography>
            )}
            {enableDisplayProductShipping && currentCityInfo && mobile && (
              <Link
                component="button"
                variant="primary"
                level="caption1"
                onClick={() => {
                  setOpenShippingLocationModal(true);
                  dispatch(EVENT_SHIPPING_SELECTOR({ action: 'click_default_zipcode' }));
                }}
                endDecorator={
                  <ArrowForwardIos
                    sx={{
                      width: '20px',
                      height: '20px',
                    }}
                  />
                }
              >
                {`${currentCityInfo?.city ? `${currentCityInfo.city}, ` : ''}${currentCityInfo?.zipcode}`}
              </Link>
            )}
            {displayShippingInfo && (
              <Typography
                level="body2"
                sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}
              >{`Ship from ${warehouseName}`}</Typography>
            )}
          </Stack>
        </Stack>
        {enableDisplayProductShipping && currentCityInfo && !mobile && (
          <Link
            component="button"
            variant="primary"
            level="caption1"
            onClick={() => {
              setOpenShippingLocationModal(true);
              dispatch(EVENT_SHIPPING_SELECTOR({ action: 'click_default_zipcode' }));
            }}
            endDecorator={
              <ArrowForwardIos
                sx={{
                  width: '20px',
                  height: '20px',
                }}
              />
            }
            sx={{
              flex: '0 1 auto',
            }}
          >
            {`${currentCityInfo?.city ? `${currentCityInfo.city}, ` : ''}${currentCityInfo?.zipcode}`}
          </Link>
        )}
      </Stack>
      {leadTimeShippingFee && trackingFeatureService.enabledDisplayShowroom && <Divider />}
      <ShippingLocationModal
        open={openShippingLocationModal}
        onClose={() => setOpenShippingLocationModal(false)}
        finalSlug={finalSlug}
      />
    </>
  );
};
