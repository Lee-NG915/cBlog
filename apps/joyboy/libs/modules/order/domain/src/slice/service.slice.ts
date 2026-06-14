import type { ServiceType, AddonServiceType } from '../entity/service.entity';
import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { PayloadAction, EntityState, createEntityAdapter } from '@reduxjs/toolkit';

export const SERVICE_FEATURE_KEY = 'service';
/**
 * cartAdapter
 * @description 通过createEntityAdapter生成的，一组可重用的reducer和selector来管理存储中的规范化数据
 */
export const serviceAdapter = createEntityAdapter<ServiceType | AddonServiceType>({});
export interface ServiceState extends EntityState<ServiceType | AddonServiceType, number> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string | null;
  serviceList: ServiceType[];
  service: ServiceType | null;
  addonServices: AddonServiceType[];
}

export const initialServiceState: ServiceState = serviceAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  serviceList: [],
  service: null,
  addonServices: [],
});

export const serviceSlice = createSliceWithThunks({
  name: SERVICE_FEATURE_KEY,
  initialState: initialServiceState,
  reducers: (create) => ({
    setServiceList: create.reducer((state, { payload }: PayloadAction<ServiceType[]>) => {
      state.serviceList = payload;
    }),
    setAddonServices: create.reducer((state, { payload }: PayloadAction<AddonServiceType[]>) => {
      // console.log('🚀 ~ file: service.slice.ts ~ payload', payload, typeof payload);
      state.addonServices = payload;
    }),
  }),
  selectors: {
    selectServiceList: (state: ServiceState) => state.serviceList,
    selectServices: (state: ServiceState) => state.serviceList,
    selectAddonServices: (state: ServiceState) => state.addonServices,
  },
});

/*
 * Export reducer for store configuration.
 */
export const serviceReducer = serviceSlice.reducer;
export type ServiceSliceType = typeof serviceSlice;

export const { setAddonServices } = serviceSlice.actions;
export const { selectServiceList, selectAddonServices, selectServices } = serviceSlice.selectors;
