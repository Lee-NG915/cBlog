'use client';
import React, { useState } from 'react';
import { Card, Button, Drawer } from '@castlery/fortress';
import { Plus } from '@castlery/fortress/Icons';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectedCurrentCustomer } from '@castlery/modules-user-domain';
import { addAddressCommand } from '@castlery/modules-checkout-services';
import { AddAddressForm, SearchAddress, type SearchAddressValue } from '@castlery/shared-components';

export interface PosAddAddressProps {
  type: 'ship_address' | 'bill_address';
  afterAdd?: () => void;
}

export function PosAddAddress({ type, afterAdd }: PosAddAddressProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<'inAutoCompetePage' | 'inAddressFormPage'>('inAutoCompetePage');
  const handleDrawer = () => {
    setStep('inAutoCompetePage');
    setOpen((pre) => !pre);
  };
  const handleSubmitOnCompleteYourAddress = async (data: Record<string, any>) => {
    if (!customer?.id) {
      return Promise.reject('No customer id');
    }
    await dispatch(
      addAddressCommand({
        uid: customer?.id,
        address: data,
        type: type,
      })
    );
    setOpen((pre) => !pre);
    afterAdd && afterAdd();
  };
  const [addressOptions, setAddressOptions] = useState<SearchAddressValue | null>(null);
  const customer = useAppSelector(selectedCurrentCustomer);

  return (
    <React.Fragment>
      <Card sx={{ p: 3 }}>
        <Button
          variant="tertiary"
          startDecorator={<Plus />}
          sx={{ margin: 'auto' }}
          onClick={() => {
            setOpen(true);
          }}
        >
          Add New Address
        </Button>
      </Card>

      <Drawer
        title={step === 'inAutoCompetePage' ? 'Search Your Location' : 'Complete Your Address'}
        open={open}
        showCloseButton
        onClose={handleDrawer}
      >
        {step === 'inAutoCompetePage' ? (
          <SearchAddress
            onChange={(value) => {
              setAddressOptions(value);
              if (value) {
                setStep('inAddressFormPage');
              }
            }}
            onClick={() => {
              setStep('inAddressFormPage');
            }}
          />
        ) : (
          <AddAddressForm
            defaultCustomer={customer}
            defaultAddress={addressOptions}
            cancel={handleDrawer}
            submit={handleSubmitOnCompleteYourAddress}
          />
        )}
      </Drawer>
    </React.Fragment>
  );
}

export default PosAddAddress;