'use client';

import { Stack } from '@castlery/fortress';
import type { User } from '@castlery/types';
import { useState, useMemo, useCallback } from 'react';
import { LocationSearch, LocationSearchType, AddressForm, AddressFormActionType } from '@castlery/shared-components';
import { CustomerAddressEntity } from '@castlery/types';
export interface PosAddressFormProps {
    cancel: () => void;
    submit: (addressId: number) => Promise<void>;
    defaultAddress?: CustomerAddressEntity | null;
    defaultCustomer?: User;
}
export function PosAddressForm({ cancel, submit, defaultAddress = null, defaultCustomer }: PosAddressFormProps) {
    const defaultFormValues = useMemo(
        () => ({
            firstname: defaultCustomer?.firstname,
            lastname: defaultCustomer?.lastname,
            phone: defaultCustomer?.phone,
            ...defaultAddress,
        }),
        [defaultCustomer, defaultAddress]
    );

    const [addressOptions, setAddressOptions] = useState(null);

    const onSelectedLocation = useCallback(
        async (result: any) => {
            setAddressOptions({
                firstname: defaultCustomer?.firstname,
                lastname: defaultCustomer?.lastname,
                phone: defaultCustomer?.phone,
                ...result,
            });
        },
        [defaultCustomer]
    );

    return (
        <>
            <Stack sx={{ mb: 6 }}>
                <LocationSearch
                    type={LocationSearchType.ADDRESS}
                    placeholder="Search your location"
                    onSubmit={async (result: any) => {
                        onSelectedLocation(result);
                    }}
                />
            </Stack>
            <AddressForm
                actionType={AddressFormActionType.ADD}
                onCancel={cancel}
                useNewVersion
                defaultAddress={defaultFormValues as any}
                updatedAddress={addressOptions as any}
                onSaved={submit}
            />
        </>
    );
}
