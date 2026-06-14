import { api } from '@castlery/shared-redux-services';

export const subscriptionsApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      postSubscription: builder.mutation<
        void,
        { email: string; source: string; [key: string]: string | number | object }
      >({
        query: ({ email, source, ...rest }) => ({
          url: 'subscriptions',
          method: 'POST',
          body: {
            email,
            source,
            ...rest,
          },
        }),
        extraOptions: {
          retryCondition: (error: any) => {
            return !(error.status === 400 || error.status === 403 || error.status === 422);
          },
          maxRetries: 1 as any,
        },
      }),
    };
  },
});

export const { usePostSubscriptionMutation } = subscriptionsApi;

export const { postSubscription } = subscriptionsApi.endpoints;
