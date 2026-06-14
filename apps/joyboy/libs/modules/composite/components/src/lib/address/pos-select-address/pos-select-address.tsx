'use client';
import React from 'react';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { PosAddAddress } from '../pos-add-address/pos-add-address';
import { AddressList } from '../pos-address-list/pos-address-list';
import { selectCheckoutAddress } from '@castlery/modules-composite-services';
import { AddressEntity, changeAddressByOrderNumber } from '@castlery/modules-checkout-domain';
import { AddressOptions } from '@castlery/modules-user-domain';
import { selectCurrentOrderNumber } from '@castlery/modules-order-domain';

export interface PosSelectAddressProps {
    afterSelect: () => void;
    type: 'ship_address' | 'bill_address';
    customerAddresses: AddressOptions[];
}
export const PosSelectAddress = ({ type, afterSelect, customerAddresses }: PosSelectAddressProps) => {
    const dispatch = useAppDispatch();
    const orderNumber = useAppSelector(selectCurrentOrderNumber);
    const { billingAddress, shippingAddress } = useAppSelector(selectCheckoutAddress);

    const orderAddressId = type === 'ship_address' ? shippingAddress?.id : billingAddress?.id;

    const handleSelect = async (id: number) => {
        const address = customerAddresses?.find((address) => Number(address.id) === Number(id));
        if (!address) return;
        if (!orderNumber || !address) return;
        const extra =
            type === 'ship_address'
                ? {
                    ship_address_attributes: address,
                    bill_address_attributes: billingAddress || ({} as AddressEntity), // Ensure bill_address_attributes is not nullable
                }
                : {
                    bill_address_attributes: address,
                    ship_address_attributes: shippingAddress || ({} as AddressEntity), // Ensure ship_address_attributes is not nullable
                };

        await dispatch(changeAddressByOrderNumber.initiate({ number: orderNumber, ...extra }));
        afterSelect && afterSelect();
    };
    return (
        <>
            <AddressList
                key={orderAddressId}
                defaultActiveAddressId={orderAddressId}
                addressList={customerAddresses}
                onSelect={handleSelect}
                AddAddressSection={<PosAddAddress type={type} afterAdd={afterSelect} />}
            />
        </>
    );
};

export default PosSelectAddress;