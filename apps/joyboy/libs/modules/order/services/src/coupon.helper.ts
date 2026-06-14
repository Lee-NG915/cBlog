import { setCouponsV2, type CouponItemV2 } from '@castlery/modules-promotion-domain';
import { fetchCouponsCommand } from '@castlery/shared-services';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import { RootState } from '@castlery/shared-redux-store';

export const refreshAndAutoApplyCoupon = createAsyncThunk(
  'order/refreshAndApplyCoupon',
  async (_, { dispatch, extra, getState, rejectWithValue }) => {
    await dispatch(setCouponsV2([]));
    const { persistenceHandles } = extra as ExtraArgument;
    const orderNumber = persistenceHandles.orderNumber.getItem() || undefined;
    if (!orderNumber) {
      return rejectWithValue('refreshAndAutoApplyCoupon>>:orderNumber is not found');
    }
    const res = await dispatch(fetchCouponsCommand());

    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    if (res.payload && res.payload.length > 0) {
      await dispatch(setCouponsV2(res.payload as unknown as CouponItemV2[]));
      const rootState = getState() as RootState;
      const items = rootState.order.order?.line_items || [];
      if (!items.length) {
        return rejectWithValue('refreshAndAutoApplyCoupon>>:lineItems is not found');
      }
      return res.payload;
    }
    return rejectWithValue('coupons is not found');
  }
);

export const autoCouponMarked = (orderNumber: string, couponCode: string) => {
  return `${orderNumber}_${couponCode}`;
};
