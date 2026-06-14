import { api } from '@castlery/shared-redux-services';
import { WEB_CHANNEL, X_CHANNEL, accessInAU, accessInSG } from '@castlery/config';

// Define a service using a base URL and expected endpoints
export const subscriptionApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      lltSubscribe: builder.mutation<
        void,
        {
          email: string;
          variantSku: string;
          quantity: number;
          zipcode: string;
          city?: string;
          state?: string;
          bundleOptions?: {
            bundle_option_id: number;
            bundle_option_variant_id: number;
          }[];
        }
      >({
        query: (data) => ({
          url: '/subscriptions',
          method: 'POST',
          headers: {
            [X_CHANNEL]: WEB_CHANNEL,
          },
          body: {
            source: 'LLT',
            email: data.email,
            extra: {
              variant_sku: data.variantSku,
              quantity: data.quantity,
              ...(!accessInSG && {
                zipcode: data.zipcode,
                city: data.city,
                state: data.state,
              }),
              ...(data.bundleOptions && {
                options: {
                  bundle_options: data.bundleOptions,
                },
              }),
              // options : {
              // bundle_options: Object.keys(selectedVariants).map((key) => ({
              //   bundle_option_id: key,
              //   bundle_option_variant_id: selectedVariants[key].id,
              // })),
              // };
            },
          },
        }),
      }),
    };
  },
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints

export const { useLltSubscribeMutation } = subscriptionApi;

// // export endpoints for use in SSR
export const { lltSubscribe } = subscriptionApi.endpoints;
