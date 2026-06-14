/* eslint-disable @nx/enforce-module-boundaries */
import { api } from '@castlery/shared-redux-services';
import { YotpoRedemPtionOption } from '../entity/yotpo.entity';
import { enableYotpo } from '@castlery/config';

// Define a service using a base URL and expected endpoints
export const yotpoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getYotpoCustomerDetails: builder.query<any, string>({
      queryFn(arg, api, extraOptions, baseQuery) {
        //优化： 统一做判断用户是否登录
        // 需要检测是否在服务端，不可以直接使用window
        return enableYotpo
          ? baseQuery({
              url: `yotpo/customers?customer_email=${window?.encodeURIComponent(arg)}`,
            })
          : {
              data: { points_balance: 0 },
            };
      },
      extraOptions: { maxRetries: 1 },
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
      extraOptions: { maxRetries: 1 },
    }),
    redeemYotpoCredits: builder.mutation<
      any,
      { customerEmail: string; customerId: number; redemptionOptionId: string }
    >({
      query: ({ customerEmail, customerId, redemptionOptionId }) => ({
        url: '/yotpo/redemptions',
        method: 'POST',
        body: { customer_email: customerEmail, customer_id: customerId, redemption_option_id: redemptionOptionId },
      }),
      extraOptions: { maxRetries: 1 },
    }),
  }),
});

export const { useGetYotpoCustomerDetailsQuery, useGetYotpoRedemptionOptionsQuery, useRedeemYotpoCreditsMutation } =
  yotpoApi;

export const { getYotpoCustomerDetails, getYotpoRedemptionOptions, redeemYotpoCredits } = yotpoApi.endpoints;
