/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface StripeState {
  discoveredReaders: any[];
  reader: { location?: string; id?: string };
  processingReader: any;
  secret: string;
  connectionStatus?: string;
  paymentStatus?: string;
}

const initialStateStripe: StripeState = {
  discoveredReaders: [],
  reader: { location: '' },
  processingReader: {},
  secret: '',
};

export const stripeSlice = createSliceWithThunks({
  name: 'Stripe',
  initialState: initialStateStripe,
  reducers: (create) => {
    return {
      setStripeSecret: create.reducer((state, { payload }: PayloadAction<string>) => {
        state.secret = payload;
      }),
      callDiscoverReaders: create.asyncThunk(async () => {
        const readers = await window.terminal.discoverReaders();
        return readers;
      }),
      clearReader: create.reducer((state) => {
        state.reader = {};
      }),
      updateConnectionStatus: create.reducer((state, { payload }: PayloadAction<string>) => {
        state.connectionStatus = payload;
      }),
      updatePaymentStatus: create.reducer((state, { payload }: PayloadAction<string>) => {
        state.paymentStatus = payload;
      }),
      connectReader: create.asyncThunk(async (reader) => {
        const connectReader = await window.terminal.connectReader(reader, { fail_if_in_use: true });

        return connectReader;
      }),
      readerConnected: create.reducer((state, { payload }: PayloadAction<string>) => {
        state.reader.location = payload;
      }),
    };
  },
  extraReducers: (builder) => {
    builder.addCase(callDiscoverReaders.fulfilled, (state, { payload }) => {
      state.discoveredReaders = payload.discoveredReaders;
    });
  },
  selectors: {
    currentStripeSecret: (state) => state.secret,
    discoverReaders: (state) => state.discoveredReaders,
    currentHadConnectedReader: (state) => state.reader?.location && state.reader.location !== '',
  },
});

export const stripeReducer = stripeSlice.reducer;

export const {
  setStripeSecret,
  clearReader,
  updateConnectionStatus,
  updatePaymentStatus,
  callDiscoverReaders,
  connectReader,
  readerConnected,
} = stripeSlice.actions;

export const { currentStripeSecret, discoverReaders, currentHadConnectedReader } = stripeSlice.selectors;
