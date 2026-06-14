'use client';
import { useEffect, useState } from 'react';
import { Stack, Typography } from '@castlery/fortress';
import type { CheckoutAddressEntity_V2 } from '@castlery/types';
import { PosAddressDisplayCard } from '../pos-address-display-card/pos-address-display-card';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { BackdropLoading } from '@castlery/shared-components';
import {
  selectCheckoutBillingAddress,
  selectCheckoutAddress,
  selectCheckoutZipcode,
  useGetCheckoutAddressListQuery,
  useValidateAddressForShippingAndUpdateMutation,
  selectFetchCheckoutDataLoading,
  getCheckoutAddressList,
} from '@castlery/modules-checkout-domain';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { PosAddNewAddress } from '../pos-add-new-address/pos-add-new-address';
import { logger } from '@castlery/observability/client';

type AddressType = 'shipAddress' | 'billAddress';

export const PosShippingAddressSection = () => {
  const dispatch = useAppDispatch();
  const fetchCheckoutDataLoading = useAppSelector(selectFetchCheckoutDataLoading);
  const shippingAddress = useAppSelector(selectCheckoutAddress);
  const billingAddress = useAppSelector(selectCheckoutBillingAddress);
  const checkoutZipcode = useAppSelector(selectCheckoutZipcode);

  const persistenceHandles = makePersistenceHandles() as any;
  const checkoutToken = persistenceHandles.xCheckoutSessionToken?.getItem();
  const { data: checkoutAddressList } = useGetCheckoutAddressListQuery(undefined, { skip: !checkoutToken });
  const [validateAndUpdateCheckoutAddress] = useValidateAddressForShippingAndUpdateMutation();

  // 新增地址后到 redux 数据回流之间的乐观选中
  const [optimisticIds, setOptimisticIds] = useState<Partial<Record<AddressType, number>>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const loading = fetchCheckoutDataLoading || isProcessing;

  const list = checkoutAddressList?.data;
  const hasAddressList = !!list && list.length > 0;

  const resolveSelected = (type: AddressType, currentId: number | undefined): CheckoutAddressEntity_V2 | null => {
    if (!list) return null;
    const optimisticId = optimisticIds[type];
    if (optimisticId) return list.find((a) => a.id === optimisticId) ?? null;
    if (currentId) return list.find((a) => a.id === currentId) ?? null;
    if (checkoutZipcode) return list.find((a) => a.zipcode === checkoutZipcode.zipcode) ?? null;
    return null;
  };

  const selectedShippingAddress = resolveSelected('shipAddress', shippingAddress?.id);
  const selectedBillingAddress = resolveSelected('billAddress', billingAddress?.id);

  const clearOptimisticId = (type: AddressType) =>
    setOptimisticIds((prev) => {
      if (prev[type] === undefined) return prev;
      const next = { ...prev };
      delete next[type];
      return next;
    });

  const handleAddAddress = async (type: AddressType, addressId: number, onClose: () => void) => {
    if (isProcessing) return;
    let succeeded = false;
    try {
      setIsProcessing(true);
      await dispatch(getCheckoutAddressList.initiate(undefined, { forceRefetch: true }));
      setOptimisticIds((prev) => ({ ...prev, [type]: addressId }));
      const res = await validateAndUpdateCheckoutAddress({ addressId, type });
      if ('error' in res) return;
      succeeded = true;
      onClose?.();
    } catch (error) {
      logger.error('after add address error', { error });
    } finally {
      setIsProcessing(false);
      if (!succeeded) clearOptimisticId(type);
    }
  };

  // redux 真实数据追上乐观选中后，清掉乐观态
  useEffect(() => {
    if (optimisticIds.shipAddress !== undefined && shippingAddress?.id === optimisticIds.shipAddress) {
      clearOptimisticId('shipAddress');
    }
    if (optimisticIds.billAddress !== undefined && billingAddress?.id === optimisticIds.billAddress) {
      clearOptimisticId('billAddress');
    }
  }, [shippingAddress?.id, billingAddress?.id, optimisticIds.shipAddress, optimisticIds.billAddress]);

  const renderSection = (title: string, type: AddressType, address: CheckoutAddressEntity_V2 | null) => (
    <Stack spacing={2} sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Typography level="subh2">{title}</Typography>
      {hasAddressList ? (
        <PosAddressDisplayCard address={address} type={type} />
      ) : (
        <PosAddNewAddress
          onAddedNewAddress={(addressId, onClose) => handleAddAddress(type, addressId, onClose ?? (() => undefined))}
        />
      )}
    </Stack>
  );

  return (
    <Stack
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gridTemplateRows: '1fr',
        gap: 4,
        pt: 2,
        position: 'relative',
      }}
    >
      {loading && <BackdropLoading loading={loading} />}
      {renderSection('Shipping Address', 'shipAddress', selectedShippingAddress)}
      {renderSection('Billing Address', 'billAddress', selectedBillingAddress)}
    </Stack>
  );
};
