import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Stack,
  HookForm,
  Typography,
  Button,
  Drawer,
  Divider,
  IconButton,
  useNiceModal,
  Link,
} from '@castlery/fortress';
import { form, validators, termsLink, privacyLink } from './helper';
import { useAsyncFn } from 'react-use';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { createCustomerFromPosChannel, selectedCurrentCustomer } from '@castlery/modules-user-domain';
import { AddAccount } from '@castlery/fortress/Icons';
import { addAddressForNewCustomerCommand } from '@castlery/modules-checkout-services';
import { AddAddressForm, SearchAddress, type SearchAddressValue } from '@castlery/shared-components';

interface Payload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}
export interface AddNewCustomerFormProps {
  onSubmit: (data: Payload) => Promise<any>;
  onCancel: () => void;
}
export function AddNewCustomerForm({ onSubmit, onCancel }: AddNewCustomerFormProps) {
  const [addState, handleAdd] = useAsyncFn(async (data: Payload) => {
    return await onSubmit(data);
  }, []);

  const errorMessage = useMemo(
    () => (addState.loading ? '' : addState.error ? addState.error?.data?.errors?.[0]?.detail : ''),
    [addState]
  );

  return (
    <Stack sx={{ paddingY: 3, gap: 4 }}>
      <HookForm
        form={form}
        validators={validators}
        submit={(data: Record<string, any>) => handleAdd(data as Payload)}
        formSxProps={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography level="caption1" color="danger" sx={{ marginY: 3 }}>
          {errorMessage}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 4,
          }}
        >
          <Button variant="tertiary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={addState.loading}>
            Add Customer
          </Button>
        </Box>
      </HookForm>

      <Divider />
      <Typography level="caption1">
        Before clicking the Add button, please make sure customers agree to Castlery's{' '}
        <Link underline="always" target="_blank" href={termsLink}>
          Terms of Use
        </Link>{' '}
        and{' '}
        <Link underline="always" target="_blank" href={privacyLink}>
          Privacy Policy
        </Link>
        . They will be opted in to our newsletters, and can unsubscribe at anytime.
      </Typography>
    </Stack>
  );
}

export interface PosAddNewCustomerProps {
  iconButton?: boolean;
  afterAddCustomer?: () => void;
  defaultStep?: 'Add New Customer' | 'Select Address' | 'Complete Your Address';
}

export function PosAddNewCustomer({
  iconButton = false,
  afterAddCustomer,
  defaultStep = 'Complete Your Address',
}: PosAddNewCustomerProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'Add New Customer' | 'Select Address' | 'Complete Your Address'>(defaultStep);
  const [addressOptions, setAddressOptions] = useState<SearchAddressValue | null>(null);
  const [modal, contextHolder] = useNiceModal();
  const customer = useAppSelector(selectedCurrentCustomer);

  const handleAddCustomer = useCallback(
    async (data: Payload) => {
      await dispatch(createCustomerFromPosChannel.initiate(data)).unwrap();
      setStep('Select Address');
    },
    [dispatch]
  );

  const handleCancelAddCustomer = useCallback(() => {
    setOpen(false);
  }, []);

  const onCancelOnCompleteYourAddress = useCallback(() => {
    setStep('Select Address');
  }, []);

  const handleSubmitOnCompleteYourAddress = useCallback(
    async (data: Record<string, any>) => {
      if (!customer?.id) {
        return Promise.reject('No customer id');
      }
      await dispatch(
        addAddressForNewCustomerCommand({
          address: data,
          uid: customer.id,
        })
      ).unwrap();
      setOpen(false);
      afterAddCustomer?.();
    },
    [customer, dispatch, afterAddCustomer]
  );

  const handleSearchAddressChange = useCallback((value: SearchAddressValue | null) => {
    setAddressOptions(value);
    if (value) {
      setStep('Complete Your Address');
    }
  }, []);

  const handleSearchAddressClick = useCallback(() => {
    setStep('Complete Your Address');
  }, []);

  const handleOpenNewCustomer = useCallback(() => {
    setOpen(true);
    setStep('Add New Customer');
  }, []);

  const handleDrawerClose = useCallback(() => {
    if (step === 'Complete Your Address') {
      modal.warning({
        title: 'You are about to cancel the address creation',
        confirmText: 'Stay',
        cancelText: 'Leave',
        onCancel() {
          setOpen(false);
        },
      });
      return;
    }
    setOpen(false);
    afterAddCustomer?.();
  }, [step, modal, afterAddCustomer]);

  return (
    <React.Fragment>
      {iconButton ? (
        !customer && (
          <IconButton sx={{ minHeight: 24, minWidth: 24, p: 0 }} onClick={() => setOpen(true)}>
            <AddAccount />
          </IconButton>
        )
      ) : (
        <Button fullWidth variant="primary" onClick={handleOpenNewCustomer}>
          New Customer
        </Button>
      )}

      <Drawer title={step} open={open} showCloseButton onClose={handleDrawerClose}>
        {step === 'Add New Customer' && (
          <AddNewCustomerForm onSubmit={handleAddCustomer} onCancel={handleCancelAddCustomer} />
        )}
        {step === 'Select Address' && (
          <SearchAddress onChange={handleSearchAddressChange} onClick={handleSearchAddressClick} />
        )}
        {step === 'Complete Your Address' && (
          <AddAddressForm
            defaultCustomer={customer}
            defaultAddress={addressOptions}
            cancel={onCancelOnCompleteYourAddress}
            submit={handleSubmitOnCompleteYourAddress}
          />
        )}
      </Drawer>
      {contextHolder}
    </React.Fragment>
  );
}

export default PosAddNewCustomer;
