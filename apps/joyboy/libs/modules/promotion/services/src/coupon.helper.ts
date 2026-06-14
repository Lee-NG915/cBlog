import { createAsyncThunk } from '@reduxjs/toolkit';
import { appliedCouponActionSucceededEvent, type AppliedCouponCategory } from '@castlery/modules-promotion-domain';

/**
 * @description Shape of the mutation trigger returned by `useAddCouponToCartMutation` /
 * `useCheckoutAddCouponToCartMutation`. The trigger is passed into the command so the
 * UI keeps its mutation-hook-driven loading state while the command owns the orchestration
 * (mutation call + behavior event dispatch).
 */
type ApplyCouponMutationTrigger = (couponCode: string) => {
  unwrap: () => Promise<{ isValid: boolean; invalidReason: string }>;
};

type ApplyCouponCommandPayload = {
  couponCode: string;
  category: AppliedCouponCategory;
  trigger: ApplyCouponMutationTrigger;
};

type ApplyCouponCommandResult = { isValid: boolean; invalidReason: string };

const runApplyCouponCommand = async (
  { couponCode, category, trigger }: ApplyCouponCommandPayload,
  dispatch: (action: unknown) => void,
  rejectWithValue: (value: unknown) => unknown
) => {
  try {
    const data = await trigger(couponCode).unwrap();
    dispatch(appliedCouponActionSucceededEvent({ couponCode, category }));
    return data;
  } catch (error) {
    return rejectWithValue(error) as ApplyCouponCommandResult;
  }
};

/**
 * @description Apply-coupon command (cart scope). Wraps `addCouponToCart` mutation trigger
 * and dispatches `appliedCouponActionSucceededEvent` on success so tracking listeners stay
 * decoupled from RTK Query endpoint matchers.
 */
export const addCouponToCartCommand = createAsyncThunk<ApplyCouponCommandResult, ApplyCouponCommandPayload>(
  'promotion/addCouponToCartCommand',
  async (payload, { dispatch, rejectWithValue }) =>
    runApplyCouponCommand(payload, dispatch, rejectWithValue) as Promise<ApplyCouponCommandResult>
);

/** @description Apply-coupon command (checkout scope). See {@link addCouponToCartCommand}. */
export const addCouponToCheckoutCommand = createAsyncThunk<ApplyCouponCommandResult, ApplyCouponCommandPayload>(
  'promotion/addCouponToCheckoutCommand',
  async (payload, { dispatch, rejectWithValue }) =>
    runApplyCouponCommand(payload, dispatch, rejectWithValue) as Promise<ApplyCouponCommandResult>
);
