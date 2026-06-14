'use client';
import { Box, Typography } from '@castlery/fortress';
import type { Meta } from '@storybook/react';
import { AddressForm, AddressFormProps, AddressFormActionType } from './address-form';

const meta: Meta<AddressFormProps> = {
  component: AddressForm,
  title: 'shared/AddressForm',
};
export default meta;

export const Primary = {
  args: {
    onCancel: () => {},
  },
  render: (props: AddressFormProps) => {
    return (
      <Box>
        <AddressForm {...props} />
      </Box>
    );
  },
};

export const UpdateAddress = {
  args: {
    onCancel: () => {},
    actionType: AddressFormActionType.UPDATE,
  },
  render: (props: AddressFormProps) => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Typography level="h3">
          Use update type address from, when submitting, the update address API will be called{' '}
        </Typography>
        <AddressForm {...props} />
      </Box>
    );
  },
};
