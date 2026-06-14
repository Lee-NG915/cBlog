import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PosUmsMarketCode, PosUmsPermissionState } from '../entity/pos-ums-permission.entity';

const initialState: PosUmsPermissionState = {
  status: 'idle', // 权限状态，'idle' | 'loading' | 'ready' | 'unauthenticated' | 'error'
  market: null,
  permissions: [],
};

export const posUmsPermissionSlice = createSliceWithThunks({
  name: 'posUmsPermission',
  initialState,
  reducers: (create) => {
    return {
      setPosUmsPermissionLoading: create.reducer((state, { payload }: PayloadAction<{ market: PosUmsMarketCode }>) => {
        // loading 不清空 market，用来标识“正在拉取哪个市场的权限”；权限数组是否可用由 status 决定。
        state.status = 'loading';
        state.market = payload.market;
        state.error = undefined;
      }),
      setPosUmsPermissionReady: create.reducer(
        (state, { payload }: PayloadAction<{ market: PosUmsMarketCode; permissions: string[]; loadedAt: number }>) => {
          state.status = 'ready';
          state.market = payload.market;
          state.permissions = payload.permissions;
          state.loadedAt = payload.loadedAt;
          state.error = undefined;
        }
      ),
      setPosUmsPermissionUnauthenticated: create.reducer(
        (state, { payload }: PayloadAction<{ market: PosUmsMarketCode }>) => {
          state.status = 'unauthenticated';
          state.market = payload.market;
          state.permissions = [];
          state.loadedAt = undefined;
          state.error = undefined;
        }
      ),
      setPosUmsPermissionError: create.reducer(
        (state, { payload }: PayloadAction<{ market: PosUmsMarketCode; error: string }>) => {
          state.status = 'error';
          state.market = payload.market;
          state.permissions = [];
          state.loadedAt = undefined;
          state.error = payload.error;
        }
      ),
      resetPosUmsPermission: create.reducer((state) => {
        state.status = 'idle';
        state.market = null;
        state.permissions = [];
        state.loadedAt = undefined;
        state.error = undefined;
      }),
    };
  },
  selectors: {
    selectedPosUmsPermissionState: (state) => state,
    selectedPosUmsPermissionStatus: (state) => state.status,
    selectedPosUmsPermissionMarket: (state) => state.market,
    selectedPosUmsPermissions: (state) => state.permissions,
    selectedPosUmsPermissionError: (state) => state.error,
    selectedPosUmsPermissionsLoadedAt: (state) => state.loadedAt,
  },
});

export const {
  setPosUmsPermissionLoading,
  setPosUmsPermissionReady,
  setPosUmsPermissionUnauthenticated,
  setPosUmsPermissionError,
  resetPosUmsPermission,
} = posUmsPermissionSlice.actions;

export const {
  selectedPosUmsPermissionState,
  selectedPosUmsPermissionStatus,
  selectedPosUmsPermissionMarket,
  selectedPosUmsPermissions,
  selectedPosUmsPermissionError,
  selectedPosUmsPermissionsLoadedAt,
} = posUmsPermissionSlice.selectors;
