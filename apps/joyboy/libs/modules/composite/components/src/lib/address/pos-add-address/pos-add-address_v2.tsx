'use client';
import React, { useState } from 'react';
import { Card, Button, Drawer, DialogContent } from '@castlery/fortress';
import { Plus } from '@castlery/fortress/Icons';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectedCurrentCustomer } from '@castlery/modules-user-domain';
import { AddAddressForm } from '@castlery/shared-components';
import { LocationSearch, LocationSearchType } from '@castlery/shared-components';

export interface PosAddAddressProps {
  afterAdd: (addressId: number) => Promise<void>;
}

export function PosAddAddress({ afterAdd }: PosAddAddressProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<'inAutoCompetePage' | 'inAddressFormPage'>('inAutoCompetePage');
  const handleDrawer = () => {
    setStep('inAutoCompetePage');
    setOpen((pre) => !pre);
  };
  const [addressOptions, setAddressOptions] = useState(null);
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
        onClose={handleDrawer}
        sx={{
          // 媒体查询 大于600px，设置宽度 558
          '& .MuiDrawer-content': {
            // width: '100vw', // 默认小屏 100vw
            '@media (min-width:600px)': {
              width: 558, // 大于 600px 时改为 558px
            },
          },
        }}
      >
        <DialogContent sx={{ px: 6 }}>
          {step === 'inAutoCompetePage' ? (
            <LocationSearch
              type={LocationSearchType.ADDRESS}
              placeholder="Search your location"
              onSubmit={async (result: any) => {
                setAddressOptions(result);
                setStep('inAddressFormPage');
              }}
            />
          ) : (
            <AddAddressForm
              defaultCustomer={customer}
              defaultAddress={addressOptions}
              cancel={handleDrawer}
              submit={async (addressId: number) => {
                setOpen((pre) => !pre);
                afterAdd && afterAdd(addressId);
              }}
            />
          )}
        </DialogContent>
      </Drawer>
    </React.Fragment>
  );
}
