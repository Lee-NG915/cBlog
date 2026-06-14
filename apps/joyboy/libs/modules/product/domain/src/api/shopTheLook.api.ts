import { api } from '@castlery/shared-redux-services';
// import { WEB_CHANNEL, X_CHANNEL } from '@castlery/config';
// import { setShopTheLookVariantData } from '../slice/shopTheLook.slice';

export const shopTheLookApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      getShopTheLookVariant: builder.query<any[], string>({
        query: (queryStr) =>
          `/variants?${new URLSearchParams({
            ids: queryStr,
          })}`,
        extraOptions: {
          maxRetries: 3 as any,
          retryCondition: (error: any) => error.status !== 404 && error.status !== 422,
        },
      }),
      // getShopTheLookVariant: builder.query<[any], string>({
      //   query: (query) => {
      //     return {
      //       url: `https://apigw-sg-test.castlery.com/variants?${new URLSearchParams({
      //         ids: query,
      //       })}`,
      //     };
      //   },
      //   async onQueryStarted(query, { dispatch, queryFulfilled }) {
      //     const result = await queryFulfilled;
      //     dispatch(setShopTheLookVariantData(result.data));
      //   },
      // }),
    };
  },
});

export const { useGetShopTheLookVariantQuery } = shopTheLookApi;
export const { getShopTheLookVariant } = shopTheLookApi.endpoints;
