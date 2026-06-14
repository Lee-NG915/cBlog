'use client';
import { Stack } from '@castlery/fortress';
// eslint-disable-next-line
import { PosShippingAddressSection, ShippingPreference } from '@castlery/modules-checkout-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { getCheckoutInfo, selectUpdateShippingMethodLoading } from '@castlery/modules-checkout-domain';
import { LoadingMasker, CircleLoadingState } from '@castlery/shared-components';
import { PosShipmentsSection } from '../shipments-section/pos-shipments-section';

export const PosCheckoutShippingMethod = () => {
  // noCache: true表示 页面刷新的场景，其他页面操作导致的更新都是false
  const dataLoading = useAppSelector(getCheckoutInfo.select({ noCache: true, needsShippingMethod: true })).isLoading;
  const updateShippingMethodLoading = useAppSelector(selectUpdateShippingMethodLoading);

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      sx={{
        position: 'relative',
        gap: 7,
      }}
    >
      {dataLoading ? (
        <CircleLoadingState loading={dataLoading} />
      ) : (
        <>
          <LoadingMasker loading={updateShippingMethodLoading} />
          {/* <PosShippingAddressSection /> */}
          <ShippingPreference />
          <PosShipmentsSection />
        </>
      )}
    </Stack>
  );
};

export default PosCheckoutShippingMethod;
