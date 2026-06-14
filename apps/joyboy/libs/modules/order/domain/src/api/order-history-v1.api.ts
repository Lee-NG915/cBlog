import { apiV1, tagTypes } from '@castlery/shared-redux-services';
import { OrderHistoryV1Response, OrderV1DetailsResponse } from '@castlery/types';
import { accessInPos } from '@castlery/config';

// 分页参数接口
export interface OrderHistoryV1Params {
  page: number;
  pageSize: number;
  /**
   * 是否刷新特定页的数据（用于倒计时结束后刷新当前订单所在页）
   */
  refreshPage?: boolean;
}

export const orderHistoryApiV1 = apiV1.injectEndpoints({
  endpoints: (builder) => ({
    getPosCustomerOrderHistoryV1: builder.query<OrderHistoryV1Response, OrderHistoryV1Params>({
      query: (params) => ({
        url: '/api/v1/pos/order/list',
        method: 'GET',
        params: {
          page: params.page,
          pageSize: params.pageSize,
        },
      }),
      transformResponse: (response: OrderHistoryV1Response, _meta, arg) => {
        // 为 POS 订单列表补充 currentPage，供倒计时结束后精准刷新当前页使用。
        return {
          ...response,
          data: {
            ...response.data,
            list: response.data?.list?.map((order) => ({
              ...order,
              currentPage: arg.page,
            })),
          },
        };
      },
      // ✨ 添加 tags - 为查询提供标签
      providesTags: (result, error, arg) => [
        { type: tagTypes.PosOrderHistory, id: 'LIST' },
        { type: tagTypes.PosOrderHistory, id: `page-${arg.page}` },
      ],
    }),
    getCustomerOrderHistoryV1: builder.query<OrderHistoryV1Response, OrderHistoryV1Params>({
      query: (params) => ({
        url: '/api/v1/order/list',
        method: 'GET',
        params: {
          page: params.page,
          pageSize: params.pageSize,
        },
      }),
      transformResponse: (response: OrderHistoryV1Response, _meta, arg) => {
        return {
          ...response,
          data: {
            ...response.data,
            list: response.data?.list?.map((order) => ({
              ...order,
              currentPage: arg.page,
            })),
          },
        };
      },
      // ✨ 添加 tags - 为查询提供标签
      providesTags: (result, error, arg) => [
        { type: tagTypes.OrderHistory, id: 'LIST' },
        { type: tagTypes.OrderHistory, id: `page-${arg.page}` },
      ],
      // 分页数据合并策略：累加新数据到已有数据
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        const nextPageList = newItems.data?.list ?? [];
        const currentList = currentCache.data?.list ?? [];

        // 1. 刷新特定页的数据（refreshPage=true）
        if (arg?.refreshPage && arg.page) {
          const pageSize = arg.pageSize;
          const startIndex = (arg.page - 1) * pageSize;

          // 替换指定范围的数据
          const updatedList = [...currentList];
          nextPageList.forEach((newOrder, index) => {
            const targetIndex = startIndex + index;
            if (targetIndex < updatedList.length) {
              updatedList[targetIndex] = newOrder;
            }
          });

          return {
            ...currentCache,
            data: {
              ...currentCache.data,
              list: updatedList,
            },
          };
        }

        // 2. 滚动加载：追加新数据（page > 1 且非刷新）
        if (arg?.page && arg.page > 1) {
          if (!currentCache.data) {
            currentCache.data = { ...newItems.data, list: [...nextPageList] };
            return currentCache;
          }
          if (!currentCache.data.list) {
            currentCache.data.list = [];
          }
          currentCache.data.list.push(...nextPageList);
          return currentCache;
        }

        // 3. 第一页首次加载：直接替换
        return newItems;
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        // 如果是刷新特定页，强制重新请求
        if (currentArg?.refreshPage) {
          return true;
        }
        return currentArg?.page !== previousArg?.page;
      },
    }),
    getOrderDetailsV1: builder.query<OrderV1DetailsResponse, { id: string }>({
      query: ({ id }) => ({
        url: accessInPos ? '/api/v1/pos/order/detail' : '/api/v1/order/detail',
        method: 'GET',
        params: {
          id: id,
        },
      }),
      // ✨ 添加 tags - 为订单详情提供标签
      providesTags: (result, error, arg) => [
        { type: tagTypes.PosOrderHistory, id: arg.id },
        { type: tagTypes.OrderHistory, id: arg.id },
      ],
    }),
    //  关闭订单接口  /api/v1/pos/order/cancel
    cancelOrderV1: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: accessInPos ? '/api/v1/pos/order/cancel' : '/api/v1/order/cancel',
        method: 'PUT',
        body: { id: id },
      }),
      // ✨ 添加 invalidatesTags - 取消订单后使缓存失效
      invalidatesTags: (result, error, arg) => [
        { type: tagTypes.PosOrderHistory, id: 'LIST' },
        { type: tagTypes.OrderHistory, id: 'LIST' },
        { type: tagTypes.PosOrderHistory, id: arg.id },
        { type: tagTypes.OrderHistory, id: arg.id },
      ],
    }),
  }),
});

export const {
  useGetCustomerOrderHistoryV1Query,
  useGetPosCustomerOrderHistoryV1Query,
  useLazyGetCustomerOrderHistoryV1Query,
  useLazyGetPosCustomerOrderHistoryV1Query,
  useGetOrderDetailsV1Query,
  useLazyGetOrderDetailsV1Query,
  useCancelOrderV1Mutation,
} = orderHistoryApiV1;

export const { getCustomerOrderHistoryV1, getPosCustomerOrderHistoryV1, getOrderDetailsV1, cancelOrderV1 } =
  orderHistoryApiV1.endpoints;
