import { createAsyncThunk } from '@reduxjs/toolkit';
import { getYotpoCustomerDetails, getYotpoRedemptionOptions, redeemYotpoCredits } from '@castlery/modules-order-domain';
import { fetchCouponsCommand } from '@castlery/shared-services';
import { selectedCurrentCustomer } from '@castlery/modules-user-domain';
import { ExtraArgument } from '@castlery/shared-redux-extra';

/**
 * 获取积分和兑换选项
 *
 */
export const getYotpoPointsCommand = createAsyncThunk(
  'credits/getYotpoPoints',
  async (customerEmail: string, { dispatch, rejectWithValue }) => {
    if (!customerEmail) {
      return rejectWithValue('Invalid customerEmail');
    }
    const res = await dispatch(getYotpoCustomerDetails.initiate(customerEmail, { forceRefetch: true }));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);
export const getYotpoRedeemOptionsCommand = createAsyncThunk(
  'credits/getYotpoRedeemOptions',
  async (
    { customerEmail, customerId }: { customerEmail: string; customerId: number },
    { dispatch, rejectWithValue }
  ) => {
    if (!customerEmail || !customerId) {
      return rejectWithValue('Invalid customerId or customerId');
    }
    const res = await dispatch(
      getYotpoRedemptionOptions.initiate({ customerEmail, customerId }, { forceRefetch: true })
    );
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

export const redeemYotpoCreditsCommand = createAsyncThunk(
  'credits/redeemYotpoCredits',
  async (redemptionOptionId: number, { dispatch, getState, rejectWithValue }) => {
    const rootState = getState() as any;
    const customer = selectedCurrentCustomer(rootState);
    if (!customer?.email || !customer?.id || !redemptionOptionId) {
      return rejectWithValue('Invalid customerId or customerId or redemptionOptionId');
    }
    const res = await dispatch(
      redeemYotpoCredits.initiate({ customerEmail: customer.email, customerId: customer.id, redemptionOptionId })
    );
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

export const refreshCouponsAndCredits = async ({
  dispatch,
  getState,
  extra,
}: {
  dispatch: any;
  getState: any;
  extra: any;
}) => {
  const { persistenceHandles } = extra as ExtraArgument;
  const orderNumber = persistenceHandles.orderNumber.getItem();
  if (orderNumber) {
    console.log('refreshCouponsAndCredits orderNumber is ------->', orderNumber);
    await dispatch(fetchCouponsCommand());
  }
  const customer = selectedCurrentCustomer(getState() as any);
  if (customer?.email && customer?.id) {
    await dispatch(getYotpoPointsCommand(customer.email));
    await dispatch(getYotpoRedeemOptionsCommand({ customerEmail: customer.email, customerId: customer.id }));
  }
};
