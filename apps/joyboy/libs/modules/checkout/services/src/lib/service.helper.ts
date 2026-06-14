import { getAvailableShipmentServices } from '@castlery/modules-checkout-domain';
import { selectCurrentOrderNumber } from '@castlery/modules-order-domain';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@castlery/shared-redux-store';
import { ecPosFeatures } from '@castlery/config';

export const loadAvailableShipmentServices = createAsyncThunk(
  'checkout/loadAvailableShipmentServices',
  async (_, { getState, dispatch }) => {
    const rootState = getState() as RootState;
    const orderNumber = selectCurrentOrderNumber(rootState);
    if (!ecPosFeatures.enabledAdditionalServices || !orderNumber) return null;
    const { data } = await dispatch(getAvailableShipmentServices.initiate(orderNumber));
    return data;
  }
);
