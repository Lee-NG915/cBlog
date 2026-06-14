import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { CustomerAddressEntity, ReviewItem, User, ReviewResponse, UserSubscription } from '@castlery/types';
import { PayloadAction } from '@reduxjs/toolkit';
import { getCurrentAdmin } from '../api/user.api';
import crypto from 'crypto';

type UserState = {
  user: User | null;
  profileLoading: boolean;
  address: CustomerAddressEntity[] | undefined;
  addressLoading: boolean;
  reviews: ReviewResponse | undefined;
  reviewsLoading: boolean;
  subscriptions: UserSubscription | undefined;
};

export const userSlice = createSliceWithThunks({
  name: 'user',
  initialState: {
    user: null,
    tokens: null,
    profileLoading: false,
    address: undefined,
    addressLoading: false,
    reviews: undefined,
    reviewsLoading: false,
    subscriptions: undefined,
  } as UserState,
  reducers: (create) => {
    return {
      setUser: create.reducer((state, { payload }: PayloadAction<User | null>) => {
        if (payload === null) {
          state.user = null;
          return;
        }
        state.user = payload;
        const { firstname, lastname, email, phone } = payload;
        state.user = {
          ...payload,
          firstnameHashed: crypto.createHash('sha256').update(firstname).digest('hex'),
          lastnameHashed: crypto.createHash('sha256').update(lastname).digest('hex'),
          emailHashed: crypto.createHash('sha256').update(email).digest('hex'),
          phoneHashed: phone ? crypto.createHash('sha256').update(phone).digest('hex') : '',
        };
      }),
      setCustomerAddress: create.reducer((state, { payload }: PayloadAction<CustomerAddressEntity[] | undefined>) => {
        state.address = payload;
      }),
      setCustomerReviews: create.reducer((state, { payload }: PayloadAction<ReviewResponse | undefined>) => {
        state.reviews = payload;
      }),
      setUserSubscriptions: create.reducer((state, { payload }: PayloadAction<UserSubscription | undefined>) => {
        state.subscriptions = payload;
      }),
    };
  },
  extraReducers(builder) {
    builder
      .addMatcher(getCurrentAdmin.matchFulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addMatcher(
        (action) => {
          const isRightApi = action.meta?.arg?.endpointName === 'updateUserProfile';
          return isRightApi && action.type.endsWith('/pending');
        },
        (state: UserState) => {
          state.profileLoading = true;
        }
      )
      .addMatcher(
        (action) => {
          const isRightApi = action.meta?.arg?.endpointName === 'updateUserProfile';
          return isRightApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state: UserState) => {
          state.profileLoading = false;
        }
      )
      .addMatcher(
        (action) => {
          const isRightApi = action.meta?.arg?.endpointName === 'getCustomerAddress';
          return isRightApi && action.type.endsWith('/pending');
        },
        (state: UserState) => {
          state.addressLoading = true;
        }
      )
      .addMatcher(
        (action) => {
          const isRightApi = action.meta?.arg?.endpointName === 'getCustomerAddress';
          return isRightApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state: UserState) => {
          state.addressLoading = false;
        }
      )
      .addMatcher(
        (action) => {
          const isRightApi = action.meta?.arg?.endpointName === 'getCustomerReviews';
          return isRightApi && action.type.endsWith('/pending');
        },
        (state: UserState) => {
          state.reviewsLoading = true;
        }
      )
      .addMatcher(
        (action) => {
          const isRightApi = action.meta?.arg?.endpointName === 'getCustomerReviews';
          return isRightApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state: UserState) => {
          state.reviewsLoading = false;
        }
      )
      .addDefaultCase((state) => state);
  },
  selectors: {
    selectedActiveUser: (sliceState) => sliceState.user,
    selectedUid: (sliceState) => sliceState.user?.id,
    selectedWebCustomerHasLogedIn: (state) => state.user && state.user?.email,
    selectedProfileLoading: (sliceState) => sliceState.profileLoading,
    selectedCustomerAddress: (sliceState) => sliceState.address,
    selectedCustomerAddressLoading: (sliceState) => sliceState.addressLoading,
    selectedCustomerReviews: (sliceState) => sliceState.reviews,
    selectedCustomerReviewsLoading: (sliceState) => sliceState.reviewsLoading,
    selectedUserSubscriptions: (sliceState) => sliceState.subscriptions,
  },
});

export const { setUser, setCustomerAddress, setCustomerReviews, setUserSubscriptions } = userSlice.actions;

export const {
  selectedActiveUser,
  selectedUid,
  selectedProfileLoading,
  selectedCustomerAddress,
  selectedCustomerAddressLoading,
  selectedCustomerReviews,
  selectedCustomerReviewsLoading,
  selectedUserSubscriptions,
} = userSlice.selectors;

export type UserSlice = typeof userSlice;
