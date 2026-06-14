import { api, tagTypes } from '@castlery/shared-redux-services';
import type {
  AttachmentsItemType,
  User,
  ReviewItem,
  SubmitReviewData,
  ReviewResponse,
  CreateUserFromWebChannelResponse,
  UserSubscription,
} from '@castlery/types';
import { EcEnv, POS_CHANNEL, WEB_CHANNEL, X_CHANNEL } from '@castlery/config';

interface ListResponse<T> {
  count: number;
  current_page: number;
  total_pages: number;
  results: T[];
}

// Define a service using a base URL and expected endpoints
export const userApi = api.injectEndpoints({
  endpoints: (builder) => {
    const getCurrentUserInfo = builder.query<User, void>({
      query: () => {
        return {
          url: `users/me`,
        };
      },
      extraOptions: {
        maxRetries: 0 as any,
      },
    });

    return {
      getSalesUsers: builder.query<User[], void>({
        query: () => `user/sales`,
        providesTags: (result) =>
          result
            ? [...result.map(({ id }) => ({ type: tagTypes.User, id })), { type: tagTypes.User, id: 'LIST' }]
            : [{ type: tagTypes.User, id: 'LIST' }],
      }),
      createUserFromWebChannel: builder.mutation<CreateUserFromWebChannelResponse, Partial<User>>({
        query: (body) => ({
          url: `users`,
          headers: {
            [X_CHANNEL]: WEB_CHANNEL,
          },
          method: 'POST',
          body,
        }),
      }),
      createCustomerFromPosChannel: builder.mutation<{ user: User }, Partial<User>>({
        query: (payload) => ({
          url: `users`,
          method: 'POST',
          body: { ...payload },
          headers: {
            [X_CHANNEL]: POS_CHANNEL,
          },
        }),
      }),
      getCurrentUser: getCurrentUserInfo,
      getCurrentAdmin: getCurrentUserInfo,
      updateUserProfile: builder.mutation<User, any>({
        query: (payload) => ({
          url: `users/me`,
          method: 'PUT',
          body: payload,
        }),
        extraOptions: {
          // 失败后不重试
          retryCondition: () => false,
        },
      }),
      getUserByUid: builder.query<User, string | number>({
        query: (uid) => `users/${uid}`,
      }),
      getUsers: builder.query<
        ListResponse<User>,
        {
          per_page?: number;
          q: string;
          page?: number;
        }
      >({
        query: (params) => {
          const { per_page = 10, q = '', page = 1 } = params || {};
          return {
            url: `users?per_page=${per_page}&q=${encodeURIComponent(q)}&page=${page}`,
          };
        },
      }),
      updateUser: builder.mutation<User, Partial<User> & Pick<User, 'id'>>({
        query: ({ id, ...patch }) => ({
          url: `user/${id}`,
          method: 'PUT',
          body: patch,
        }),
      }),
      uploadAttachment: builder.mutation<{ attachment: AttachmentsItemType }, FormData>({
        query: (formData) => ({
          url: 'gw/attachments',
          method: 'POST',
          body: formData,
        }),
      }),
      updateReview: builder.mutation<ReviewItem, { id: number; data: SubmitReviewData }>({
        query: (payload) => ({
          url: `gw/reviews/${payload.id}`,
          method: 'PUT',
          body: payload.data,
        }),
      }),
      getCustomerReviews: builder.query<ReviewResponse, void>({
        query: () => ({
          url: `/gw/reviews/by_user`,
          query: {
            per_page: 50,
          },
        }),
      }),
      getReviewNeededItems: builder.query<any[], { shipment_id?: number }>({
        query: (params) => ({
          url: `/gw/reviews/needed_items`,
          params,
        }),
      }),
      getUserSubscriptions: builder.query<UserSubscription, void>({
        query: () => ({
          url: `/users/me/subscriptions`,
        }),
      }),
      updateUserSubscriptions: builder.mutation<
        UserSubscription,
        {
          unsubscribe_reason: string;
          message_groups: any[];
        }
      >({
        query: (data) => ({
          url: `/users/me/subscriptions`,
          method: 'PUT',
          body: data,
        }),
      }),
      createUserSubscriptions: builder.mutation<UserSubscription, { email?: string }>({
        query: (data) => ({
          url: `/subscriptions`,
          method: 'POST',
          body: data,
        }),
      }),
      submitReview: builder.mutation<ReviewItem, SubmitReviewData>({
        query: (data) => ({
          url: `/gw/reviews`,
          method: 'POST',
          body: data,
        }),
      }),
      resetPasswordEmail: builder.mutation<void, { email: string; from_email: boolean }>({
        query: (data) => ({
          url: `users/recover_password`,
          method: 'POST',
          body: data,
        }),
        extraOptions: {
          retryCondition: () => false,
        },
      }),
      validateResetPasswordToken: builder.query<void, { secret: string }>({
        query: (data) => ({
          url: `users/validate_reset_password_token/${data?.secret}`,
          method: 'GET',
        }),
        extraOptions: {
          retryCondition: () => false,
        },
      }),
      resetPassword: builder.mutation<
        { email: string },
        { password: string; reset_password_token: string; version: number }
      >({
        query: (data) => ({
          url: `users/reset_password`,
          method: 'POST',
          body: data,
        }),
        extraOptions: {
          retryCondition: () => false,
        },
      }),
      recoverPassword: builder.mutation<void, { email: string; from_email?: boolean }>({
        query: (data) => ({
          url: `/users/recover_password`,
          method: 'POST',
          body: data,
        }),
      }),
    };
  },
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
// export const { } = userApi;
export const {
  useGetSalesUsersQuery,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useUpdateUserMutation,
  useGetCurrentAdminQuery,
  useGetUsersQuery,
  useUpdateUserProfileMutation,
  useUploadAttachmentMutation,
  useUpdateReviewMutation,
  useGetCustomerReviewsQuery,
  useGetReviewNeededItemsQuery,
  useSubmitReviewMutation,
  useResetPasswordEmailMutation,
  useCreateUserFromWebChannelMutation,
  useValidateResetPasswordTokenQuery,
  useLazyValidateResetPasswordTokenQuery,
  useResetPasswordMutation,
  useGetUserSubscriptionsQuery,
  useUpdateUserSubscriptionsMutation,
  useCreateUserSubscriptionsMutation,
  useRecoverPasswordMutation,
  util: { getRunningQueriesThunk },
} = userApi;

export const {
  createUserFromWebChannel,
  createCustomerFromPosChannel,
  getUsers,
  getCurrentUser,
  getCurrentAdmin,
  getUserByUid,
  updateUser,
  updateUserProfile,
  uploadAttachment,
  updateReview,
  getCustomerReviews,
  getReviewNeededItems,
  submitReview,
  validateResetPasswordToken,
  resetPassword,
  getUserSubscriptions,
  updateUserSubscriptions,
  createUserSubscriptions,
  recoverPassword,
} = userApi.endpoints;

export const getCurrentUserFromServer = async (accessToken: string) => {
  try {
    const result = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/users/me`, {
      headers: {
        'X-Access-Token': accessToken,
        'X-Channel': `${EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase()}`,
      },
      next: {
        revalidate: 100,
      },
    });

    return result;
  } catch (error) {
    console.error('Failed to get current user from server', { error });
    return null;
  }
};
