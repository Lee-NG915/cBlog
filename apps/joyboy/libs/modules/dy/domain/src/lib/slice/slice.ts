import { createSliceWithThunks } from '@castlery/shared-redux-core';

interface DYState {
  campaignsData: Record<string, any>;
}

const initialDYState: DYState = {
  campaignsData: {},
};

interface SetDYCampaignDataPayload {
  campaignName: string;
  campaignData: any;
}

export const dySlice = createSliceWithThunks({
  name: 'dy',
  initialState: initialDYState,
  reducers: (create) => {
    return {
      setDYCampaignData: create.reducer((state, { payload }: { payload: SetDYCampaignDataPayload }) => {
        if (payload) {
          const { campaignName, campaignData } = payload;
          state.campaignsData[campaignName] = campaignData;
        }
      }),
    };
  },
  selectors: {
    selectDYCampaignData: (state) => state.campaignsData,
  },
});

export const { setDYCampaignData } = dySlice.actions;

export const { selectDYCampaignData } = dySlice.selectors;
