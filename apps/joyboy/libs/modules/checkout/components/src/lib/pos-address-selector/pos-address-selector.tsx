'use client';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { BackdropLoading } from '@castlery/shared-components';
import {
  selectCheckoutAddress,
  selectCheckoutAddressList,
  selectCheckoutBillingAddress,
  useValidateAddressForShippingAndUpdateMutation,
  getCheckoutAddressList,
} from '@castlery/modules-checkout-domain';
import { PosAddNewAddress } from '../pos-add-new-address/pos-add-new-address';
import { Box } from '@castlery/fortress';
import { CheckoutAddressList } from '../checkout-address-list/checkout-address-list';
import { useState, useEffect } from 'react';
import { CustomerAddressEntity_V2 } from '@castlery/types';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { noticeCityInfoUpdated } from '@castlery/modules-user-domain';

export interface PosAddressSelectorProps {
  afterSelect: () => void;
  type: 'shipAddress' | 'billAddress';
}
export const PosAddressSelector = ({ type, afterSelect }: PosAddressSelectorProps) => {
  const dispatch = useAppDispatch();
  const shippingAddress = useAppSelector(selectCheckoutAddress);
  const billingAddress = useAppSelector(selectCheckoutBillingAddress);
  const checkoutAddressList = useAppSelector(selectCheckoutAddressList);

  const reduxAddressId = type === 'shipAddress' ? shippingAddress?.id : billingAddress?.id;

  const [validateAddressForShippingAndUpdate, { isLoading: validating }] =
    useValidateAddressForShippingAndUpdateMutation();

  // 乐观选中：mutation 期间覆盖 redux 真实选中，失败时清除
  const [optimisticId, setOptimisticId] = useState<number>();
  const [refetching, setRefetching] = useState(false);

  const selectedAddressId = optimisticId ?? reduxAddressId;
  const loading = validating || refetching;

  const selectAddress = async (addressId: number) => {
    setOptimisticId(addressId);
    const res = await validateAddressForShippingAndUpdate({ addressId, type });
    if ('error' in res) {
      setOptimisticId(undefined);
      return;
    }
    // 成功不清：保持选中态直到 drawer 关闭/组件卸载，避免回落到尚未同步的 redux 旧值
    afterSelect();
  };

  const onSelect = (address: CustomerAddressEntity_V2) => {
    if (loading) return;
    selectAddress(address.id);
  };

  const onAddedNewAddress = async (addressId: number) => {
    if (loading) return;
    try {
      setRefetching(true);
      await dispatch(getCheckoutAddressList.initiate(undefined, { forceRefetch: true }));
      await selectAddress(addressId);
    } finally {
      setRefetching(false);
    }
  };

  // 仅在 redux 真实地址变化时同步 city；不要监听乐观 id，
  // 否则 dispatch -> 父级按 city/zipcode re-key -> 本组件 remount -> 乐观态丢失
  useEffect(() => {
    if (type !== 'shipAddress') return;
    const confirmedId = shippingAddress?.id;
    if (!confirmedId) return;
    const address = checkoutAddressList.find((a) => a.id === confirmedId);
    if (!address) return;
    const payload = { zipcode: address.zipcode, city: address.city, state: address.stateName ?? '' };
    dispatch(noticeCityInfoUpdated(payload));
    makePersistenceHandles().city.setItem(JSON.stringify(payload));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingAddress?.id, type]);

  return (
    <Box sx={{ p: 6, position: 'relative' }}>
      {loading && <BackdropLoading loading={loading} />}
      <CheckoutAddressList selectedAddressId={selectedAddressId ?? undefined} onSelect={onSelect} />
      <Box sx={{ mt: 5 }}>
        <PosAddNewAddress onAddedNewAddress={onAddedNewAddress} />
      </Box>
    </Box>
  );
};
