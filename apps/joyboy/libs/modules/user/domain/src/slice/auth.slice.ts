import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { PayloadAction } from '@reduxjs/toolkit';
import { Tokens } from '../entity/user.entity';
import type { ExtraArgument } from '@castlery/shared-redux-extra';

type AuthState = {
  tokens: Tokens | null;
  isLoggedIn: boolean;
};

const initialState = {
  tokens: {},
  isLoggedIn: false,
} as AuthState;

export const authSlice = createSliceWithThunks({
  name: 'auth',
  initialState,
  reducers: (create) => {
    return {
      logout: create.asyncThunk(
        async (
          {
            autoLocationReload = true,
          }: {
            autoLocationReload?: boolean;
          },
          { extra }
        ) => {
          const { persistenceHandles } = extra as ExtraArgument;
          persistenceHandles.city.removeItem();
          persistenceHandles.accessToken.removeItem();
          persistenceHandles.refreshToken.removeItem();
          persistenceHandles.isLoggedIn.removeItem();
          persistenceHandles.orderNumber.removeItem();
          persistenceHandles.customerId.removeItem();
          persistenceHandles.temporaryCustomerEmail.removeItem();
          if (autoLocationReload && location) {
            location.reload();
          }
        }
      ),
      tokenReceived: create.reducer((state, { payload }: PayloadAction<Tokens>) => {
        state.tokens = payload;
        state.isLoggedIn = true;
      }),
    };
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, () => {
      return initialState;
    });
  },
  selectors: {
    selectedTokens: (state: AuthState) => state.tokens,
    selectedIsLoggedIn: (state: AuthState) => state.isLoggedIn,
  },
});

export const { tokenReceived, logout } = authSlice.actions;
export const { selectedTokens, selectedIsLoggedIn } = authSlice.selectors;

export type AuthSlice = typeof authSlice;
