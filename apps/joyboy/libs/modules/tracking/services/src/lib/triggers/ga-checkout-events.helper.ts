import { dt, EventsNames } from '@castlery/data-tracking-events';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectedCurrentCustomer, selectedAdminUserInfo } from '@castlery/modules-user-domain';
import { selectOrder } from '@castlery/modules-order-domain';

/**
 * Scenario: When the user clicks the checkout button, the checkout event is triggered
 */
export const trackOfflineCheckout = createAsyncThunk(
  'tracking/trackOfflineCheckout',
  async (_, { getState, rejectWithValue }) => {
    const rootState = getState() as any;
    const order = selectOrder(rootState);
    const sales = selectedAdminUserInfo(rootState);
    const customer = selectedCurrentCustomer(rootState);

    try {
      dt.track(EventsNames.EVENT_OFFLINE_CHECKOUT)({
        sales,
        customer,
        order,
      });
      return Promise.resolve();
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const trackPurchase = createAsyncThunk('tracking/trackPurchase', async (_, { getState, rejectWithValue }) => {
  const rootState = getState() as any;
  const order = selectOrder(rootState);
  const admin = selectedAdminUserInfo(rootState);
  const customer = selectedCurrentCustomer(rootState);
  try {
    dt.track(EventsNames.EVENT_TRANSACTION)({
      order,
      sales: admin,
      customer: customer ?? null,
    });
    return Promise.resolve();
  } catch (e) {
    return rejectWithValue(e);
  }
});
