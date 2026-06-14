'use client';

import { Box, HookForm, Button, Stack, Typography } from '@castlery/fortress';
import { formData, countryName } from './helper';
import type { User } from '@castlery/types';
import { useAsyncFn } from 'react-use';
import { useState, useMemo, useCallback } from 'react';
import { SearchAddress, type SearchAddressValue } from '../search-address/search-address';
import { accessInSG, accessInAuAndUS, accessInAU, accessInCA } from '@castlery/config';
export interface AddAddressFormProps {
  cancel: () => void;
  submit: (data: Record<string, any>) => Promise<void>;
  defaultAddress?: SearchAddressValue | null;
  defaultCustomer?: User;
}
export function AddAddressForm({ cancel, submit, defaultAddress = null, defaultCustomer }: AddAddressFormProps) {
  const [addressOptions, setAddressOptions] = useState<SearchAddressValue | null>(defaultAddress);

  const formatAddress = useCallback(
    ({
      address1,
      street_number,
      street,
      description = '',
    }: {
      address1: string;
      street_number: string;
      street: string;
      description?: string;
    }) => {
      let finalAddress = accessInSG ? address1 : street_number || street ? `${street_number} ${street}` : '';
      if (accessInAU && description) {
        const reg = new RegExp(`^(.*?)${street.split(' ', 1)[0]}`);
        const matchArr = description.match(reg);
        if (matchArr && Array.isArray(matchArr)) {
          finalAddress = `${matchArr[1]}${street}`.trim();
        }
      }

      return finalAddress;
    },
    []
  );

  const defaultFetcher = useMemo(
    () => ({
      firstname: defaultCustomer?.firstname,
      lastname: defaultCustomer?.lastname,
      phone: defaultCustomer?.phone,
      country: countryName,
      building_name: defaultAddress?.building_name ?? '',
      street: defaultAddress?.street ?? '',
      street_number: defaultAddress?.street_number ?? '',
      building_type: defaultAddress?.building_type ?? '',
      zipcode: defaultAddress?.zipcode ?? '',
      address1: formatAddress({
        address1: defaultAddress?.address1 ?? '',
        street_number: defaultAddress?.street_number ?? '',
        street: defaultAddress?.street ?? '',
        description: defaultAddress?.description ?? '',
      }),
      address2: defaultAddress?.address2 ?? '',
      city: defaultAddress?.city ?? '',
      state_name: defaultAddress?.state_name ?? '',
    }),
    [defaultCustomer, defaultAddress, formatAddress]
  );

  const updateFormValues = useCallback(
    (values: Record<string, any>) => {
      return {
        values: {
          ...values,
          building_name: addressOptions?.building_name ?? '',
          street: addressOptions?.street ?? '',
          street_number: addressOptions?.street_number ?? '',
          building_type: addressOptions?.building_type ?? '',
          zipcode: addressOptions?.zipcode ?? '',
          address1: formatAddress({
            address1: addressOptions?.address1 ?? '',
            street_number: addressOptions?.street_number ?? '',
            street: addressOptions?.street ?? '',
            description: addressOptions?.description ?? '',
          }),
          address2: addressOptions?.address2 ?? '',
          city: addressOptions?.city ?? '',
          state_name: addressOptions?.state_name ?? '',
        },
        reset: true,
      };
    },
    [addressOptions, formatAddress]
  );

  const [{ loading, error }, handleSubmit] = useAsyncFn(
    async (data: Record<string, any>) => {
      const is_manual = accessInSG
        ? addressOptions?.building_name !== data.building_name ||
        addressOptions?.building_type !== data.building_type ||
        addressOptions?.street !== data.street ||
        addressOptions?.street_number !== data.street_number ||
        addressOptions?.zipcode !== data.zipcode
        : true;
      let result = {
        ...defaultCustomer,
        ...addressOptions,
        ...data,
        is_manual: is_manual,
        ...(accessInAuAndUS && { state: addressOptions?.state_name }),
      };
      if (accessInCA) {
        result = { ...result, zipcode: result.zipcode?.toUpperCase() };
      }
      await submit(result);
    },
    [defaultCustomer, addressOptions, submit]
  );

  return (
    <>
      {error?.data?.errors?.map(({ title, detail }: { title: string; detail: string }) => {
        return <Typography color="danger" sx={{ color: 'error' }}>{`${title} ${detail}`}</Typography>;
      })}
      <Stack sx={{ paddingY: 1 }}>
        <SearchAddress
          inline
          defaultValue={defaultAddress}
          onChange={(value) => {
            setAddressOptions(value);
          }}
        />
      </Stack>

      <HookForm
        form={formData?.formJson}
        validators={formData?.validators}
        submit={handleSubmit}
        formSxProps={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          alignItems: 'flex-end',
          gap: { xs: 2, sm: 3 },
        }}
        defaultFetcher={defaultFetcher}
        update={updateFormValues}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,minmax(auto,173px))',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 3,
            mb: 3,
          }}
        >
          <Button variant="tertiary" onClick={cancel}>
            Cancel
          </Button>
          <Button loading={loading} type="submit">
            Confirm
          </Button>
        </Box>
      </HookForm>
    </>
  );
}