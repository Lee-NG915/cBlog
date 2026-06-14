import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ExtraArgument } from '@castlery/shared-redux-extra';
import { selectCurrentOrderNumber } from '@castlery/modules-order-domain';
import {
  getCouponsByOrderNumberV2,
  applyCouponV2,
  removeCouponV2,
  setCouponsV2,
  getGiftsByOrderNumberV2,
  type CouponItemV2,
} from '@castlery/modules-promotion-domain';

const autoCouponMarked = (orderNumber: string, couponCode: string) => {
  return `${orderNumber}_${couponCode}`;
};

function resolveOrderNumber(getState: any, extra: unknown): string | undefined {
  const fromState = selectCurrentOrderNumber(getState());
  if (fromState) return fromState as string;
  const { persistenceHandles } = (extra || {}) as ExtraArgument;
  const fromExtra = persistenceHandles?.orderNumber?.getItem?.();
  return (fromExtra as string) || undefined;
}

export type PromotionCoupons = CouponItemV2[];

export const fetchCouponsCommand = createAsyncThunk<PromotionCoupons>(
  'promotion/fetchCoupons',
  async (_: void, { dispatch, getState, rejectWithValue, extra }) => {
    const orderNumber = resolveOrderNumber(getState, extra);
    if (!orderNumber) {
      return rejectWithValue('[fetchCouponsCommand]: order not found');
    }
    const res: any = await dispatch(getCouponsByOrderNumberV2.initiate(orderNumber));
    if ('error' in res) return rejectWithValue(res.error);
    if (res?.data) dispatch(setCouponsV2(res.data));
    return res.data as CouponItemV2[];
  }
);

export const applyCouponCommand = createAsyncThunk(
  'promotion/applyCoupon',
  async ({ couponCode }: { couponCode: string }, { dispatch, getState, rejectWithValue, extra }) => {
    const orderNumber = resolveOrderNumber(getState, extra);
    if (!orderNumber) {
      return rejectWithValue('[applyCouponCommand]: order not found');
    }
    const res: any = await dispatch(applyCouponV2.initiate({ orderNumber, couponCode }));
    if ('error' in res) return rejectWithValue(res.error);
    await dispatch(fetchCouponsCommand());
    return res.data;
  }
);

export const removeCouponCommand = createAsyncThunk(
  'promotion/removeCoupon',
  async ({ couponCode }: { couponCode: string }, { dispatch, getState, rejectWithValue, extra }) => {
    const orderNumber = resolveOrderNumber(getState, extra);
    if (!orderNumber) {
      return rejectWithValue('[removeCouponCommand]: order not found');
    }
    const res: any = await dispatch(removeCouponV2.initiate({ orderNumber, couponCode }));
    if ('error' in res) return rejectWithValue(res.error);

    const { persistenceHandles } = extra as ExtraArgument;
    const markedSymbol = autoCouponMarked(orderNumber, couponCode);
    persistenceHandles.autoAppliedCoupon.setItem(markedSymbol);
    return res.data;
  }
);

export const fetchGiftsCommand = createAsyncThunk(
  'promotion/fetchGifts',
  async (
    { stockLocationId, couponCode }: { stockLocationId?: string; couponCode?: string },
    { dispatch, getState, rejectWithValue, extra }
  ) => {
    const orderNumber = resolveOrderNumber(getState, extra);
    if (!orderNumber) {
      return rejectWithValue('[fetchGiftsCommand]: order not found');
    }

    const res: any = await dispatch(
      getGiftsByOrderNumberV2.initiate({ orderNumber, stockLocationId, coupon_code: couponCode })
    );
    if ('error' in res) return rejectWithValue(res.error);
    return res.data;
  }
);
