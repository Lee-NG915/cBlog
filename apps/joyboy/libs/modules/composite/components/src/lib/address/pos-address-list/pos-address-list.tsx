'use client';
import React, { useState } from 'react';
import { Box, Typography, Button, buttonClasses } from '@castlery/fortress';
import { type AddressEntity } from '@castlery/modules-checkout-domain';
import { CheckCircle } from '@castlery/fortress/Icons';
import { useAsyncFn } from 'react-use';
import { userFeatureService } from '@castlery/modules-user-services';

export interface AddressListProps {
    addressList: AddressEntity[];
    defaultActiveAddressId?: number;
    onSelect: (id: number) => Promise<void>;
    AddAddressSection?: React.ReactNode;
}

export function AddressList({ addressList, defaultActiveAddressId, onSelect, AddAddressSection }: AddressListProps) {
    const showApartmentBeforeStreet = userFeatureService.getUserAddressFeatures().showApartmentBeforeStreet;
    const [activeId, setActiveId] = useState<number | null>(defaultActiveAddressId || null);
    const [loadingState, handleSelect] = useAsyncFn(
        async (id: number) => {
            setActiveId(id);
            if (!onSelect) return Promise.resolve();
            await onSelect(id);
            return new Promise((resolve) => setTimeout(resolve, 1000));
        },
        [onSelect, setActiveId]
    );

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: { xs: 1, tablet: 3 }, pb: 2 }}>
            {addressList.map((address) => (
                <Button
                    variant={activeId === address.id ? 'outlined' : 'secondary'}
                    loading={loadingState.loading && activeId === address.id}
                    sx={{
                        m: 0,
                        gap: 0,
                        p: 2,
                        '& span': {
                            color: 'inherit',
                        },
                        [`&.${buttonClasses.loading}`]: {
                            color: 'unset',
                            opacity: 0.5,
                        },
                    }}
                    key={address.id}
                    onClick={() => handleSelect(address.id)}
                >
                    <Box>
                        <Typography>
                            {address.firstname} {address.lastname}
                        </Typography>
                        <Typography>{address.company}</Typography>
                        {showApartmentBeforeStreet ? (
                            <>
                                <Typography>{address.address2}</Typography>
                                <Typography>{address.address1}</Typography>
                            </>
                        ) : (
                            <>
                                <Typography>{address.address1}</Typography>
                                <Typography>{address.address2}</Typography>
                            </>
                        )}

                        <Typography>{address.building_name}</Typography>
                        <Typography>
                            {address.city}, {address.state_name || ''} {address.zipcode}
                        </Typography>
                        <Typography> {address.phone}</Typography>
                        {activeId === address.id && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                }}
                            >
                                <CheckCircle sx={{ fontSize: 40 }} />
                            </Box>
                        )}
                    </Box>
                </Button>
            ))}
            {AddAddressSection}
        </Box>
    );
}
export default AddressList;