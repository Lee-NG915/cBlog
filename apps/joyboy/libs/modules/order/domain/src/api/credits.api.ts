import { api } from '@castlery/shared-redux-services';
import { YotpoRedemPtionOption } from '../entity/credits.entity';
import { enableYotpo } from '@castlery/config';

// Define a service using a base URL and expected endpoints
export const creditsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getYotpoCustomerDetails: builder.query<any, string>({
      queryFn(arg, api, extraOptions, baseQuery) {
        return enableYotpo
          ? baseQuery({
              url: `yotpo/customers?customer_email=${window?.encodeURIComponent(arg)}`,
            })
          : {
              data: { points_balance: 0 },
            };
      },
    }),
    getYotpoRedemptionOptions: builder.query<YotpoRedemPtionOption[], { customerEmail: string; customerId: number }>({
      queryFn(arg, api, extraOptions, baseQuery) {
        return enableYotpo
          ? baseQuery({
              url: `yotpo/redemption_options?customer_email=${window?.encodeURIComponent(
                arg.customerEmail
              )}&customer_id=${arg.customerId}`,
            })
          : {
              data: [],
            };
      },
    }),
    redeemYotpoCredits: builder.mutation<
      any,
      { customerEmail: string; customerId: number; redemptionOptionId: number }
    >({
      query: ({ customerEmail, customerId, redemptionOptionId }) => ({
        url: 'yotpo/redemptions',
        method: 'POST',
        body: { customer_email: customerEmail, customer_id: customerId, redemption_option_id: redemptionOptionId },
      }),
    }),
  }),
});

export const { useGetYotpoCustomerDetailsQuery, useGetYotpoRedemptionOptionsQuery, useRedeemYotpoCreditsMutation } =
  creditsApi;

export const { getYotpoCustomerDetails, getYotpoRedemptionOptions, redeemYotpoCredits } = creditsApi.endpoints;
