'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { Button, Drawer, IconButton, useNiceModal, DialogContent, Stack } from '@castlery/fortress';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { selectedCurrentCustomer, setCustomer } from '@castlery/modules-user-domain';
import { AddAccount } from '@castlery/fortress/Icons';
import {
  LocationSearch,
  LocationSearchType,
  AddressForm,
  type AddressResult,
  AddressFormActionType,
  useHasPosUmsPermission,
} from '@castlery/shared-components';
import { PosCreateCustomerForm } from '../pos-create-customer-form/pos-create-customer-form';
import { POS_UMS_PERMISSIONS } from '@castlery/modules-user-services';

export type PosCreateNewCustomerStep = 'Add New Customer' | 'Select Address' | 'Complete Your Address';
export interface PosCreateNewCustomerProps {
  iconButton?: boolean;
  afterAddCustomer?: () => void;
  defaultStep?: PosCreateNewCustomerStep;
}

export function PosCreateNewCustomer({
  iconButton = false,
  afterAddCustomer,
  defaultStep = 'Add New Customer',
}: PosCreateNewCustomerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<PosCreateNewCustomerStep>(defaultStep);
  const [addressOptions, setAddressOptions] = useState<AddressResult | null>(null);
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = useNiceModal();
  const customer = useAppSelector(selectedCurrentCustomer);
  const hasCreateCustomerPermission = useHasPosUmsPermission(POS_UMS_PERMISSIONS.posTransactionAccess);

  const getInitialStep = useCallback<() => PosCreateNewCustomerStep>(() => {
    return customer ? defaultStep : 'Add New Customer';
  }, [customer, defaultStep]);

  const closeDrawer = useCallback(
    (shouldNotifyParent = false) => {
      setOpen(false);
      setAddressOptions(null);
      setStep(getInitialStep());

      if (shouldNotifyParent) {
        afterAddCustomer?.();
      }
    },
    [afterAddCustomer, getInitialStep]
  );

  const handleSearchAddressChange = useCallback((value: AddressResult) => {
    setAddressOptions(value);

    if (!value) return;

    setStep('Complete Your Address');
  }, []);

  const handleOpenNewCustomer = useCallback(() => {
    if (!hasCreateCustomerPermission) {
      console.log('You are not authorized to create a customer');
      return;
    }
    setAddressOptions(null);
    setOpen(true);
    setStep(getInitialStep());
  }, [getInitialStep]);

  const handleDrawerClose = useCallback(() => {
    if (step === 'Complete Your Address') {
      modal.warning({
        title: 'You are about to cancel the address creation',
        confirmText: 'Stay',
        cancelText: 'Leave',
        onCancel() {
          closeDrawer();
        },
      });
      return;
    }

    closeDrawer(true);
  }, [closeDrawer, modal, step]);

  const defaultAddress = useMemo(() => {
    return {
      firstname: customer?.firstname,
      lastname: customer?.lastname,
      phone: customer?.phone,
      ...addressOptions,
    };
  }, [customer, addressOptions]);

  return (
    <React.Fragment>
      {iconButton ? (
        !customer && (
          <IconButton
            sx={{ minHeight: 24, minWidth: 24, p: 0 }}
            disabled={!hasCreateCustomerPermission}
            onClick={handleOpenNewCustomer}
          >
            <AddAccount />
          </IconButton>
        )
      ) : (
        <Button fullWidth variant="primary" disabled={!hasCreateCustomerPermission} onClick={handleOpenNewCustomer}>
          New Customer
        </Button>
      )}

      <Drawer title={step} showCloseButton={step !== 'Add New Customer'} open={open} onClose={handleDrawerClose}>
        <DialogContent sx={{ p: 6 }}>
          {step === 'Add New Customer' && (
            <PosCreateCustomerForm
              onCancel={closeDrawer}
              onCreatedCustomer={(customer) => {
                dispatch(setCustomer(customer));
                setStep('Select Address');
              }}
            />
          )}
          {step === 'Select Address' && (
            <LocationSearch
              key={step}
              type={LocationSearchType.ADDRESS}
              placeholder="Search your location"
              onSubmit={handleSearchAddressChange}
            />
          )}
          {step === 'Complete Your Address' && (
            <Stack direction="column" gap={2} key={step}>
              <LocationSearch
                type={LocationSearchType.ADDRESS}
                placeholder="Search your location"
                onSubmit={handleSearchAddressChange}
              />
              <AddressForm
                actionType={AddressFormActionType.ADD}
                onCancel={() => setStep('Select Address')}
                useNewVersion
                defaultAddress={defaultAddress}
                updatedAddress={addressOptions}
                onSaved={closeDrawer}
              />
            </Stack>
          )}
        </DialogContent>
      </Drawer>
      {contextHolder}
    </React.Fragment>
  );
}
