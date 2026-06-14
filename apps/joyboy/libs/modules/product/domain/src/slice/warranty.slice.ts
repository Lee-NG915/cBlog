import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { WarrantyOffer } from '../entity/warranty.entity';
import { GuardsmanWarrantyDiscoveryResponse } from '../entity/guardsman-warranty.entity';
import { getWarrantyProvider } from '@castlery/monorepo-features';

/**
 * [保险接入] PDP 侧保险选择状态（与 Cart 侧 guardsmanCartItems 分离）
 * - Mulberry: warrantyList + selectedOfferId（US legacy 加车读 selectedOfferId）
 * - Guardsman: guardsmanDiscovery + selectedGuardsmanPlanId（CA Order V2 加车读 plan id）
 * - variant/bundle 切换时 listener 会 resetSelectedWarrantySelection
 */
interface WarrantyState {
  selectedOfferId: string;
  warrantyList: WarrantyOffer[];
  selectedGuardsmanPlanId: string;
  guardsmanDiscovery: GuardsmanWarrantyDiscoveryResponse | null;
  warrantyIsFetching: boolean;
}

const initialStateWarranty: WarrantyState = {
  selectedOfferId: '',
  warrantyList: [],
  selectedGuardsmanPlanId: '',
  guardsmanDiscovery: null,
  warrantyIsFetching: true,
};

export const warrantySlice = createSliceWithThunks({
  name: 'Warranty',
  initialState: initialStateWarranty,
  reducers: (create) => {
    return {
      setSelectedOfferId: create.reducer((state, { payload }: PayloadAction<string>) => {
        state.selectedOfferId = payload;
      }),
      resetSelectedOfferId: create.reducer((state) => {
        state.selectedOfferId = '';
      }),
      setSelectedGuardsmanPlanId: create.reducer((state, { payload }: PayloadAction<string>) => {
        state.selectedGuardsmanPlanId = payload;
      }),
      resetSelectedGuardsmanPlanId: create.reducer((state) => {
        state.selectedGuardsmanPlanId = '';
      }),
      resetSelectedWarrantySelection: create.reducer((state) => {
        state.selectedOfferId = '';
        state.selectedGuardsmanPlanId = '';
      }),
      setWarrantyList: create.reducer((state, { payload }: PayloadAction<WarrantyOffer[]>) => {
        state.warrantyIsFetching = false;
        state.warrantyList = payload;
        state.guardsmanDiscovery = null;
      }),
      setGuardsmanWarrantyDiscovery: create.reducer(
        (state, { payload }: PayloadAction<GuardsmanWarrantyDiscoveryResponse | null>) => {
          state.warrantyIsFetching = false;
          state.guardsmanDiscovery = payload;
          state.warrantyList = [];
        }
      ),
      clearGuardsmanWarrantyDiscovery: create.reducer((state) => {
        state.guardsmanDiscovery = null;
      }),
      setWarrantyIsFetching: create.reducer((state, { payload }: PayloadAction<boolean>) => {
        state.warrantyIsFetching = payload;
      }),
    };
  },
  selectors: {
    selectedOfferId: (state) => state.selectedOfferId,
    selectWarrantyList: (state) => state.warrantyList,
    selectCurrentWarrantyOffer: (state) =>
      state.warrantyList?.find((x) => x.warranty_offer_id === state.selectedOfferId),
    selectedGuardsmanPlanId: (state) => state.selectedGuardsmanPlanId,
    selectGuardsmanWarrantyDiscovery: (state) => state.guardsmanDiscovery,
    selectGuardsmanWarrantyPlans: (state) => state.guardsmanDiscovery?.plans ?? [],
    selectCurrentGuardsmanPlan: (state) =>
      state.guardsmanDiscovery?.plans?.find((plan) => plan.id === state.selectedGuardsmanPlanId),
    selectHasWarrantyPlans: (state) => {
      const provider = getWarrantyProvider();

      if (provider === 'guardsman') {
        return Boolean(state.guardsmanDiscovery?.success && state.guardsmanDiscovery?.plans?.length);
      }

      if (provider === 'mulberry') {
        return Boolean(state.warrantyList?.length);
      }

      return false;
    },
    selectSelectedWarrantyOfferId: (state) => {
      const provider = getWarrantyProvider();

      if (provider === 'guardsman') {
        return (
          state.guardsmanDiscovery?.plans?.find((plan) => plan.id === state.selectedGuardsmanPlanId)?.offerId ?? ''
        );
      }

      return state.selectedOfferId;
    },
    selectSelectedWarrantyTrackingInfo: (state) => {
      const provider = getWarrantyProvider();

      if (provider === 'guardsman') {
        const selectedPlan = state.guardsmanDiscovery?.plans?.find((plan) => plan.id === state.selectedGuardsmanPlanId);

        if (!selectedPlan) {
          return null;
        }

        return {
          durationMonths: selectedPlan.term * 12,
          price: `${selectedPlan.price}`,
        };
      }

      const selectedOffer = state.warrantyList?.find((x) => x.warranty_offer_id === state.selectedOfferId);

      if (!selectedOffer) {
        return null;
      }

      return {
        durationMonths: Number(selectedOffer.duration_months || 0),
        price: selectedOffer.cost ?? selectedOffer.customer_cost ?? '',
      };
    },
    selectWarrantyIsFetching: (state) => state.warrantyIsFetching,
  },
});

export const warrantyReducer = warrantySlice.reducer;
export const {
  setSelectedOfferId,
  resetSelectedOfferId,
  setSelectedGuardsmanPlanId,
  resetSelectedGuardsmanPlanId,
  resetSelectedWarrantySelection,
  setWarrantyList,
  setGuardsmanWarrantyDiscovery,
  clearGuardsmanWarrantyDiscovery,
  setWarrantyIsFetching,
} = warrantySlice.actions;
export const {
  selectedOfferId,
  selectWarrantyList,
  selectedGuardsmanPlanId,
  selectGuardsmanWarrantyDiscovery,
  selectGuardsmanWarrantyPlans,
  selectCurrentGuardsmanPlan,
  selectWarrantyIsFetching,
  selectCurrentWarrantyOffer,
  selectHasWarrantyPlans,
  selectSelectedWarrantyOfferId,
  selectSelectedWarrantyTrackingInfo,
} = warrantySlice.selectors;

export const warrantySDKLoadSuccess = createAsyncThunk('warranty/warrantySDKLoadSuccess', async () => {
  return null;
});
