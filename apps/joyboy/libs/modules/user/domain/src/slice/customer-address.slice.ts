import { createSliceWithThunks } from '@castlery/shared-redux-core';
// import { PayloadAction } from '@reduxjs/toolkit';
// import { Tokens } from '../entity/user.entity';
// import type { ExtraArgument } from '@castlery/shared-redux-extra';
import { Address } from '../entity/address.entity';

type CustomerAddressState = {
  customerAddressList: Address[];
  selectedAddress: Address | null;
};

const initialState = {
  customerAddressList: [],
  selectedAddress: null,
} as CustomerAddressState;

export const customerAddressSlice = createSliceWithThunks({
  name: 'customerAddress',
  initialState,
  reducers: (create) => {
    return {};
  },
  extraReducers: (builder) => {
    // builder.addCase(logout.fulfilled, () => {
    //   return initialState;
    // });
  },
  selectors: {
    selectCustomerAddressList: (state) => state.customerAddressList,
    selectCustomerAvailableAddressList: (state) => state.customerAddressList.filter((address) => address.is_valid),
  },
});

// export const {  } = customerAddressSlice.actions;
export const { selectCustomerAddressList, selectCustomerAvailableAddressList } = customerAddressSlice.selectors;
