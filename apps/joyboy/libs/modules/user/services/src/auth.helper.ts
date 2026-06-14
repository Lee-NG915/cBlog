import { ExtraArgument } from '@castlery/shared-redux-extra';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { enterApp, setTheLookWishList, setUser, setWishList } from '@castlery/modules-user-domain';
import { clearCustomerServiceUser } from '@castlery/shared-services';

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (
    payload: {
      userToken: {
        access_token: string;
        refresh_token: string;
      };
      signType: 'Signin' | 'Signup';
      channel?: string;
    },
    { dispatch, extra }
  ) => {
    const { userToken, signType, channel } = payload;
    const { access_token, refresh_token } = userToken;
    const { persistenceHandles } = extra as ExtraArgument;
    persistenceHandles.webAccessToken.setItem(access_token);
    persistenceHandles.webRefreshToken.setItem(refresh_token);
    channel && persistenceHandles.webAccountChannel.setItem(channel);
    dispatch(enterApp({ page: signType }));
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (
    {
      reload = true,
    }: {
      reload?: boolean;
    },
    { dispatch, extra }
  ) => {
    const { persistenceHandles } = extra as ExtraArgument;
    persistenceHandles.webAccessToken.removeItem();
    persistenceHandles.webRefreshToken.removeItem();
    persistenceHandles.wishItemGuestToken.removeItem();

    clearCustomerServiceUser();
    if (reload) {
      window?.location?.reload();
    } else {
      dispatch(setUser(null));
      dispatch(setWishList([]));
      dispatch(setTheLookWishList([]));
      dispatch(enterApp({ page: 'Signout' }));
    }
  }
);
