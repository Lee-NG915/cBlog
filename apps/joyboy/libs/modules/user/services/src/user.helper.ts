import type { ExtraArgument } from '@castlery/shared-redux-extra';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  adminLogin,
  getCurrentAdmin,
  noticeCityInfoUpdated,
  getCurrentUser,
  setCustomer,
} from '@castlery/modules-user-domain';
import { getRetailById } from '@castlery/modules-retails-domain';
// import { createPosOrderForCurrentAdmin } from '@castlery/modules-order-services';
import { enableBranch } from '@castlery/config';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

export const salesRepLogin = createAsyncThunk(
  'user/salesRepLogin',
  async (
    {
      username,
      password,
      retailId,
    }: // autoCreateAOrder = true,
    { username: string; password: string; retailId: number | string; autoCreateAOrder?: boolean },
    { dispatch, rejectWithValue, extra }
  ) => {
    const { persistenceHandles } = extra as ExtraArgument;
    const pre_access_token = (await persistenceHandles.accessToken.getItem()) || '';
    const pre_refresh_token = (await persistenceHandles.refreshToken.getItem()) || '';
    try {
      await dispatch(adminLogin({ username, password })).unwrap();
      let retailInfo;
      if (enableBranch) {
        retailInfo = await dispatch(getRetailById.initiate(retailId)).unwrap();
      }
      const userInfo = await dispatch(
        getCurrentAdmin.initiate(undefined, {
          forceRefetch: true,
        })
      ).unwrap();

      persistenceHandles.retailId.setItem(retailId + '');
      persistenceHandles.posSalesId.setItem(userInfo.id + '');

      // // 创建订单 -- 重构之后， 订单创建逻辑调整 -- 弃用
      // if (autoCreateAOrder) {
      //   await dispatch(createPosOrderForCurrentAdmin({}));
      // }
      if (enableBranch) {
        return { userInfo, retailInfo };
      }
      return { userInfo };
    } catch (error) {
      await persistenceHandles.accessToken.setItem(pre_access_token);
      await persistenceHandles.refreshToken.setItem(pre_refresh_token);
      return rejectWithValue(error);
    }
  }
);

export const initializePosSessionByRetail = createAsyncThunk(
  'user/initializePosSessionByRetail',
  async (
    {
      retailId,
    }: {
      retailId: number | string;
    },
    { dispatch, rejectWithValue, extra }
  ) => {
    const { persistenceHandles } = extra as ExtraArgument;
    const previousRetailId = persistenceHandles.retailId.getItem();
    // const previousPosSalesId = persistenceHandles.posSalesId.getItem();

    try {
      // 先落 retailId，保证 `getCurrentAdmin.matchFulfilled` 触发的后续请求
      // （例如 cart listener 内的首个 line-items）能够拿到 `X-Retail-Store-ID`。
      persistenceHandles.retailId.setItem(retailId + '');

      let retailInfo;
      if (enableBranch) {
        retailInfo = await dispatch(getRetailById.initiate(retailId)).unwrap();
      }

      const userInfo = await dispatch(
        getCurrentAdmin.initiate(undefined, {
          forceRefetch: true,
        })
      ).unwrap();

      persistenceHandles.retailId.setItem(retailId + '');
      // persistenceHandles.posSalesId.setItem(userInfo.id + '');

      if (enableBranch) {
        return { userInfo, retailInfo };
      }
      return { userInfo };
    } catch (error) {
      if (previousRetailId) {
        persistenceHandles.retailId.setItem(previousRetailId);
      } else {
        persistenceHandles.retailId.removeItem();
      }

      // if (previousPosSalesId) {
      //   persistenceHandles.posSalesId.setItem(previousPosSalesId);
      // } else {
      //   persistenceHandles.posSalesId.removeItem();
      // }

      return rejectWithValue(error);
    }
  }
);

export const resetUserLocation = createAsyncThunk(
  'user/resetUserLocation',
  async (
    payload: {
      state: string;
      city: string;
      zipcode: string;
    },
    { dispatch }
  ) => {
    await makePersistenceHandles()?.city?.setItem(JSON.stringify(payload));
    await dispatch(noticeCityInfoUpdated(payload));
    return Promise.resolve();
  }
);

export const refreshUserByAccessTokenInWeb = createAsyncThunk(
  'user/refreshUserByAccessTokenInWeb',
  async (_, { dispatch, extra, rejectWithValue, fulfillWithValue }) => {
    const { persistenceHandles } = extra as ExtraArgument;
    const webAccessToken = persistenceHandles.webAccessToken.getItem();
    if (!webAccessToken) {
      return rejectWithValue('webAccessToken is empty');
    }
    console.log('🚀 ~ file: user.helper.ts:80 ~ refreshUserByAccessTokenInWeb ~ webAccessToken:', webAccessToken);
    if (webAccessToken) {
      const res = await dispatch(getCurrentUser.initiate(undefined, { forceRefetch: true }));
      if (res.error) {
        return rejectWithValue(res.error);
      }
      //不应该这样写，使用addCase完成,等user模块拆分完成再更换
      res.data && dispatch(setCustomer(res.data));
      return fulfillWithValue(res.data);
    }
  }
);
