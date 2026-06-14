'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { Card, Button, Drawer, DialogContent, Stack, Typography } from '@castlery/fortress';
import { Plus } from '@castlery/fortress/Icons';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectedCurrentCustomer } from '@castlery/modules-user-domain';
import { AddressForm, AddressFormActionType, LocationSearch, LocationSearchType } from '@castlery/shared-components';

export interface PosAddNewAddressProps {
  onAddedNewAddress?: (addressId: number, onClose?: () => void) => void;
}

export function PosAddNewAddress({ onAddedNewAddress }: PosAddNewAddressProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<'inAutoCompetePage' | 'inAddressFormPage'>('inAutoCompetePage');

  const [addressOptions, setAddressOptions] = useState(null);
  const customer = useAppSelector(selectedCurrentCustomer);

  const defaultFormValues = useMemo(
    () => ({
      firstname: customer?.firstname,
      lastname: customer?.lastname,
      phone: customer?.phone,
      ...(addressOptions as any),
    }),
    [customer, addressOptions]
  );

  const handleCloseDrawer = () => {
    setStep('inAutoCompetePage');
    setOpen(false);
  };

  const onSavedNewAddress = useCallback(
    async (addressId: number) => {
      if (typeof onAddedNewAddress === 'function') {
        onAddedNewAddress?.(addressId, () => {
          setOpen(false);
        });
      } else {
        setOpen(false);
      }
    },
    [onAddedNewAddress]
  );

  const onSelectedLocation = useCallback(
    async (result: any) => {
      setAddressOptions({
        firstname: customer?.firstname,
        lastname: customer?.lastname,
        phone: customer?.phone,
        ...result,
      });
    },
    [customer]
  );

  return (
    <React.Fragment>
      <Card
        sx={{
          p: 6,
          height: '128px',
          border: '1px solid var(--fortress-palette-brand-mono-300)',
          '&:hover': {
            backgroundColor: 'var(--fortress-palette-brand-terracotta-200)',
            cursor: 'pointer',
          },
          '&:active': {
            backgroundColor: 'var(--fortress-palette-brand-terracotta-500)',
            color: 'var(--fortress-palette-brand-warmLinen-500)',
            span: {
              color: 'var(--fortress-palette-brand-warmLinen-500)',
            },
          },
        }}
      >
        <Button
          variant="plain"
          color="neutral"
          startDecorator={<Plus width={16} height={16} />}
          sx={{ margin: 'auto', '--Button-gap': 0 }}
          onClick={() => {
            setOpen(true);
          }}
        >
          <Typography
            level="caption1"
            sx={{
              textTransform: 'none',
            }}
          >
            Add New Address
          </Typography>
        </Button>
      </Card>

      <Drawer
        title={step === 'inAutoCompetePage' ? 'Search Your Location' : 'Complete Your Address'}
        open={open}
        onClose={handleCloseDrawer}
        sx={{ '& .MuiDrawer-content': { width: '558px' } }}
      >
        <DialogContent sx={{ px: 6, width: '558px' }}>
          <Stack sx={{ mb: 6 }}>
            <LocationSearch
              key={step}
              type={LocationSearchType.ADDRESS}
              placeholder="Search your location"
              onSubmit={async (result: any) => {
                if (step === 'inAutoCompetePage') {
                  setAddressOptions(result);
                  setStep('inAddressFormPage');
                } else {
                  onSelectedLocation(result);
                }
              }}
            />
          </Stack>
          {step === 'inAddressFormPage' && (
            <AddressForm
              actionType={AddressFormActionType.ADD}
              onCancel={handleCloseDrawer}
              useNewVersion
              defaultAddress={defaultFormValues as any}
              updatedAddress={addressOptions as any}
              onSaved={onSavedNewAddress}
            />
          )}
        </DialogContent>
      </Drawer>
    </React.Fragment>
  );
}
