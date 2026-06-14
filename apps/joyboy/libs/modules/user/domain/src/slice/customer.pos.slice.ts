import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Customer } from '../entity/customer.entity';
import crypto from 'crypto';

type CustomerState = {
  customer?: Customer;
};

export const customerSlice = createSliceWithThunks({
  name: 'customer',
  initialState: {} as CustomerState,
  reducers: (create) => {
    return {
      setCustomer: create.reducer((state, { payload }: PayloadAction<Customer | undefined>) => {
        if (payload === undefined) {
          state.customer = undefined;
          return;
        } else {
          const { firstname, lastname, email, phone } = payload;
          state.customer = {
            ...payload,
            firstnameHashed: crypto.createHash('sha256').update(firstname).digest('hex'),
            lastnameHashed: crypto.createHash('sha256').update(lastname).digest('hex'),
            emailHashed: crypto.createHash('sha256').update(email).digest('hex'),
            phoneHashed: phone ? crypto.createHash('sha256').update(phone).digest('hex') : '',
          };
        }
      }),
    };
  },
  selectors: {
    selectedCurrentCustomer: (state) => state.customer,
    selectedCustomerName: (state) => {
      if (!state.customer) return '';
      return `${state.customer.firstname}  ${state.customer.lastname}`;
    },
    selectedCustomerId: (state) => state.customer?.id,
  },
});

export const { setCustomer } = customerSlice.actions;
export const { selectedCurrentCustomer, selectedCustomerName, selectedCustomerId } = customerSlice.selectors;
export type CustomerSlice = typeof customerSlice;
