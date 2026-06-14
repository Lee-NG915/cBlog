import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { Zipcode } from '../entity/zipcode.entity';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import {
  EcEnv,
  enableZipCode,
  WEB_CHANNEL,
  globalDefaultCity,
  currentDefaultCity,
  BRISBANE_DEFAULT_CITY,
  EcErrorCode,
  accessInPos,
  accessInWeb,
} from '@castlery/config';
import { createSelector } from '@reduxjs/toolkit';
import { capitalize } from '@castlery/utils';

export const ZIPCODE_FEATURE_KEY = 'zipcode';

export const zipcodeSlice = createSliceWithThunks({
  name: 'zipcode',
  initialState: {
    ...currentDefaultCity,
    canApply: true,
    canFindSKU: true,
  } as {
    city: string;
    state: string;
    zipcode: string;
    isOpenZipcodeFailureModal: boolean;
    canApply?: boolean;
    canFindSKU?: boolean;
    prevCorrectShippingLocation?: Zipcode;
    errorInfo?: {
      errorZipcode?: string;
      errorCode?: number;
    };
  },
  reducers: (create) => {
    return {
      initDefaultZipcode: create.asyncThunk(async (_, { dispatch, extra }) => {
        const { persistenceHandles } = extra as ExtraArgument;
        if (accessInWeb) {
          const storageCityString = persistenceHandles.webCity.getItem();
          if (storageCityString) {
            const cityInfo = JSON.parse(storageCityString);
            dispatch(noticeCityInfoUpdated(cityInfo));
            return cityInfo;
          } else {
            const regionDefaultCity = currentDefaultCity;
            persistenceHandles.webCity.setItem(JSON.stringify(regionDefaultCity));
            return regionDefaultCity;
          }
        } else {
          const storageCityString = persistenceHandles.city.getItem();
          if (storageCityString) {
            return JSON.parse(storageCityString);
          } else {
            let initCity = globalDefaultCity; // 默认使用 us 的zipcode作为全局zipcode
            if (enableZipCode) {
              initCity = currentDefaultCity;
              const retailId = await persistenceHandles.retailId.getItem();
              // 设置 Brisbane 的默认 zipcode
              if (retailId === '69' && EcEnv.NEXT_PUBLIC_COUNTRY === 'AU') {
                initCity = BRISBANE_DEFAULT_CITY;
              }
              if (retailId === '3' && EcEnv.NEXT_PUBLIC_COUNTRY === 'US') {
                initCity = {
                  city: 'New York',
                  state: 'NY',
                  zipcode: '10011',
                };
              }
              await persistenceHandles.city.setItem(JSON.stringify(initCity));
            }
            return initCity;
          }
        }
      }),
      getCityInfo: create.asyncThunk(async (_, { extra }) => {
        const { persistenceHandles } = extra as ExtraArgument;
        const localCityString = accessInWeb ? persistenceHandles.webCity.getItem() : persistenceHandles.city.getItem();
        if (localCityString) {
          return JSON.parse(localCityString as string);
        }
        return null;
      }),
      noticeCityInfoUpdated: create.reducer((state, { payload }: { payload: Zipcode }) => {
        state.city = capitalize(payload.city);
        state.state = payload.state;
        state.zipcode = payload.zipcode;
      }),
      updateCityCanBeApply: create.reducer((state, { payload }: { payload: boolean }) => {
        state.canApply = payload;
      }),
      updateCanFindSKU: create.reducer((state, { payload }: { payload: boolean }) => {
        state.canFindSKU = payload;
      }),
      updatePrevCorrectShippingLocation: create.reducer((state, { payload }: { payload: Zipcode }) => {
        state.prevCorrectShippingLocation = payload;
      }),
      updateErrorInfo: create.reducer(
        (state, { payload }: { payload: { errorZipcode?: string; errorCode?: number } }) => {
          state.errorInfo = payload;
        }
      ),
      updateIsOpenZipcodeFailureModal: create.reducer((state, { payload }: { payload: boolean }) => {
        state.isOpenZipcodeFailureModal = payload;
      }),
    };
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type === 'zipcode/updateErrorInfo',
      (state, action) => {
        if ((action as any)?.payload?.errorCode === EcErrorCode.ZIPCODE_FAILURE) {
          state.isOpenZipcodeFailureModal = true;
        }
      }
    );
  },
  selectors: {
    selectedCurrentCity: (state) => state.city,
    selectedCurrentState: (state) => state.state,
    selectedCurrentZipcode: (state) => state.zipcode,
    selectedCurrentCityInfo: (state) => state,
    selectedCurrentCityCanBeApply: (state) => state.canApply,
    selectedCurrentCanFindSKU: (state) => state.canFindSKU,
    selectedPrevCorrectShippingLocation: (state) => state.prevCorrectShippingLocation,
    selectedErrorInfo: (state) => state.errorInfo,
    selectedIsOpenZipcodeFailureModal: (state) => state.isOpenZipcodeFailureModal,
  },
});
export const {
  initDefaultZipcode,
  getCityInfo,
  noticeCityInfoUpdated,
  updateCityCanBeApply,
  updateCanFindSKU,
  updatePrevCorrectShippingLocation,
  updateErrorInfo,
  updateIsOpenZipcodeFailureModal,
} = zipcodeSlice.actions;
export const {
  selectedCurrentCity,
  selectedCurrentState,
  selectedCurrentZipcode,
  selectedCurrentCityInfo,
  selectedCurrentCityCanBeApply,
  selectedCurrentCanFindSKU,
  selectedPrevCorrectShippingLocation,
  selectedErrorInfo,
  selectedIsOpenZipcodeFailureModal,
} = zipcodeSlice.selectors;

export const getZipcodeState = (rootState: { [ZIPCODE_FEATURE_KEY]: Zipcode }): Zipcode =>
  rootState[ZIPCODE_FEATURE_KEY];

export const selectShippingCityInfo = createSelector(
  [(state: { zipcode: Zipcode }) => getZipcodeState(state)],
  (zipcodeInfo) => {
    return {
      city: capitalize(zipcodeInfo.city),
      state: zipcodeInfo.state,
      zipcode: zipcodeInfo.zipcode,
    };
  }
);
