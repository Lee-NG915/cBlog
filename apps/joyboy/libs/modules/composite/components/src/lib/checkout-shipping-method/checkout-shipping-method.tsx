'use client';
import { Box, Stack } from '@castlery/fortress';
import {
  ShippingPreference,
  AssemblyPreference,
  DeliveryRequests,
  WebCheckoutContinueButton,
} from '@castlery/modules-checkout-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import {
  getCheckoutInfo,
  selectUpdateShippingMethodLoading,
  useUpdateCheckoutShippingMethodMutation,
  selectLocalDeliveryRequests,
  selectCanMergeShipments,
} from '@castlery/modules-checkout-domain';
import { ShipmentsSection } from '../shipments-section/shipments-section';
import { ShippingAddressInfo } from '../shipping-address-info/shipping-address-info';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { BackdropLoading, useHasOrderCreated } from '@castlery/shared-components';

const outerStackSx = { minHeight: '75vh', position: 'relative' } as const;

const innerStackSx = {
  position: 'relative',
  gap: { xs: 6, md: 8 },
  pt: { xs: 2, md: 8 },
  pb: { xs: 6, md: 8 },
  px: { xs: 6, md: 0 },
} as const;

const bottomActionSx = {
  px: { xs: 6, md: 0 },
};

const orderCreatedSx = { pointerEvents: 'none', opacity: 0.9 } as const;

export const CheckoutShippingMethod = () => {
  // noCache: true 表示页面刷新场景，其他操作导致的更新都是 false
  const fetchDataLoading = useAppSelector(
    getCheckoutInfo.select({ noCache: true, needsShippingMethod: true })
  ).isLoading;
  const dataLoading = useAppSelector(getCheckoutInfo.select({ noCache: false })).isLoading;
  const updateShippingMethodLoading = useAppSelector(selectUpdateShippingMethodLoading);
  const [updateCheckoutShippingMethod] = useUpdateCheckoutShippingMethodMutation();

  const localDeliveryRequests = useAppSelector(selectLocalDeliveryRequests);
  const canMergeShipments = useAppSelector(selectCanMergeShipments);
  const hasOrderCreated = useHasOrderCreated();

  const updateDeliveryRequest = async (): Promise<boolean> => {
    if (!localDeliveryRequests) {
      return Promise.resolve(true);
    }
    const res = await updateCheckoutShippingMethod({
      deliveryRequests: localDeliveryRequests,
    });
    if ('error' in res) {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  };

  return (
    <Stack direction="column" justifyContent="space-between" sx={outerStackSx}>
      <BackdropLoading loading={fetchDataLoading || dataLoading || updateShippingMethodLoading} />
      <Box sx={hasOrderCreated ? orderCreatedSx : undefined}>
        <Stack direction="column" justifyContent="space-between" sx={innerStackSx}>
          <ShippingAddressInfo />
          {canMergeShipments && <ShippingPreference />}
          <AssemblyPreference />
          <ShipmentsSection />
          <DeliveryRequests />
        </Stack>
      </Box>
      <Box sx={bottomActionSx}>
        <WebCheckoutContinueButton
          loading={updateShippingMethodLoading}
          disabled={updateShippingMethodLoading}
          continueHandler={updateDeliveryRequest}
          isOrderCreated={hasOrderCreated}
        />
      </Box>
    </Stack>
  );
};

export default CheckoutShippingMethod;
