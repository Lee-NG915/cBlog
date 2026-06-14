import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { ExtraArgument } from '@castlery/shared-redux-extra';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { login } from '../api/oauth.api';
import { getCurrentAdmin } from '../api/user.api';
import type { User } from '@castlery/types';

const initialState: {
  tokens?: object;
  userInfo?: User;
  page?: 'discover' | 'checkout' | 'SALES HISTORY' | 'POS_CHECKOUT';
} = {
  tokens: {},
  userInfo: undefined,
};

const initialPosUmsUserInfoState: {
  name: string;
  email: string;
} = {
  name: '',
  email: '',
};

export const adminSlice = createSliceWithThunks({
  name: 'admin',
  initialState,
  reducers: (create) => {
    return {
      adminLogin: create.asyncThunk(async ({ username, password }, { dispatch, rejectWithValue, extra }) => {
        const res = await dispatch(login.initiate({ username, password }));
        if ('error' in res) {
          return rejectWithValue(res.error);
        }
        const { persistenceHandles } = extra as ExtraArgument;
        const { access_token, refresh_token } = res.data;

        await persistenceHandles.accessToken.setItem(access_token);
        await persistenceHandles.refreshToken.setItem(refresh_token);
        await persistenceHandles.isLoggedIn.setItem('1');

        return res;
      }),
      // enterApp: create.asyncThunk(({ page }: { page: 'discover' | 'checkout' | 'SALES HISTORY' }) => {
      //   return page;
      // }),
    };
  },
  extraReducers(builder) {
    builder.addCase(enterApp.fulfilled, (state, action) => {
      state.page = action.payload;
    });
    builder.addMatcher(getCurrentAdmin.matchFulfilled, (state, action) => {
      state.userInfo = action.payload;
    });
  },
  selectors: {
    selectedAdminUserInfo: (sliceState) => sliceState.userInfo,
    selectedAdminUserName: (sliceState) => {
      let res = ' ';
      if (sliceState.userInfo) {
        res = `${sliceState.userInfo.firstname}  ${sliceState.userInfo.lastname}`;
      }
      return res;
    },
    selectedPage: (sliceState) => sliceState.page,
  },
});

export const umsUserInfoSlice = createSliceWithThunks({
  name: 'umsUserInfo',
  initialState: initialPosUmsUserInfoState,
  reducers: (create) => {
    return {
      setPosUmsUserInfo: create.reducer<{ name: string; email: string }>((state, action) => {
        state.name = action.payload.name;
        state.email = action.payload.email;
      }),
      resetPosUmsUserInfo: create.reducer((state) => {
        state.name = '';
        state.email = '';
      }),
    };
  },
  selectors: {
    selectedPosUmsUserInfo: (sliceState) => sliceState,
    selectedPosUmsUserName: (sliceState) => sliceState.name,
    selectedPosUmsUserEmail: (sliceState) => sliceState.email,
  },
});

// TODO: abby 需要来规划一下这里 因为这里的page应该和GTM 的 Page type 有映射关系的
export const enterApp = createAsyncThunk(
  'admin/enterApp',
  ({
    page,
  }: {
    page:
      | 'discover'
      | 'checkout'
      | 'SALES HISTORY'
      | 'PLP'
      | 'PLA'
      | 'Blog'
      | 'PRODUCT'
      | 'WEB_CART'
      | 'CHECKOUT_ADDRESS'
      | 'CHECKOUT_SHIPPING'
      | 'CHECKOUT_PAYMENT'
      | 'POS_CHECKOUT'
      | 'Home'
      | 'Storyblok'
      | 'entry'
      | 'Account'
      | 'Signin'
      | 'Signup'
      | 'Signout'
      | 'Delivery Review'
      | 'HelpCenter'
      | 'Wishlist'
      | 'ContactUs'
      | 'TermsAndConditions'
      | 'ShopTheLook'
      | 'Reviews'
      | 'Quiz'
      | 'Referral';
  }) => {
    return page;
  }
);

// export const selectedRefreshToken = (state: RootState) =>
//   state.auth.refresh_token;
export const { adminLogin } = adminSlice.actions;
export const { selectedAdminUserInfo, selectedAdminUserName, selectedPage } = adminSlice.selectors;
export const { setPosUmsUserInfo, resetPosUmsUserInfo } = umsUserInfoSlice.actions;
export const { selectedPosUmsUserInfo, selectedPosUmsUserName, selectedPosUmsUserEmail } = umsUserInfoSlice.selectors;
export default adminSlice.reducer;
