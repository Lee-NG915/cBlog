import { api } from '@castlery/shared-redux-services';
import type { GetSaleUsersResp, SaleListReq, SaleListResp } from '../entity/sale-list.entity';

// 抽取出来的类型

export const saleListApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      getSaleList: builder.query<SaleListResp, SaleListReq>({
        query: ({ page, per_page }) => ({
          url: `sales_users/me/orders?page=${page}&per_page=${per_page}`,
          method: 'GET',
        }),
      }),
      getSaleUsers: builder.query<GetSaleUsersResp, void>({
        query: () => ({
          url: `sales_users`,
          params: {
            per_page: 100,
          },
        }),
      }),
    };
  },
});

export const { getSaleList, getSaleUsers } = saleListApi.endpoints;
export const { useGetSaleListQuery, useGetSaleUsersQuery } = saleListApi;
