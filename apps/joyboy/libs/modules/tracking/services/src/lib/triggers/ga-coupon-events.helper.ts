import { dt, EventsNames } from '@castlery/data-tracking-events';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectedCurrentCustomer, selectedAdminUserInfo } from '@castlery/modules-user-domain';
import { selectCurrentOrderNumber } from '@castlery/modules-order-domain';

export const trackOfflineCoupon = createAsyncThunk(
  'tracking/trackOfflineCoupon',
  async (actionType: 'add' | 'select' | 'redeem', { getState, rejectWithValue }) => {
    const rootState = getState() as any;
    const orderNumber = selectCurrentOrderNumber(rootState);
    const sales = selectedAdminUserInfo(rootState);
    const customer = selectedCurrentCustomer(rootState);
    const eventNameMap = {
      add: EventsNames.EVENT_OFFLINE_ADD_COUPON,
      select: EventsNames.EVENT_OFFLINE_SELECT_COUPON,
      redeem: EventsNames.EVENT_OFFLINE_REDEEM_COUPON,
    };
    const eventName = eventNameMap[actionType];
    try {
      dt.track(eventName)({
        sales,
        customer,
        transactionId: orderNumber,
      });
      return Promise.resolve();
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);
