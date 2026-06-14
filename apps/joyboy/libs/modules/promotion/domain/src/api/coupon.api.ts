import { api, tagTypes } from '@castlery/shared-redux-services';
import type { Order } from '@castlery/types';
import { type CouponItemV2 } from '../entity/coupon.entity';

// 定义 Coupon API
export const couponApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @description 获取订单可用的优惠券列表
     * @param {string} orderNumber 订单号
     * @returns {CouponItemV2[]} 优惠券列表
     */
    getCouponsByOrderNumberV2: builder.query<CouponItemV2[], string>({
      query: (orderNumber) => `checkouts/${orderNumber}/coupons_v2`,
      transformResponse: (response: any) => {
        // 确保响应是数组
        if (!Array.isArray(response)) return [];

        // 转换每个优惠券对象，添加 available 字段
        return response.map((coupon) => ({
          ...coupon,
          // 根据 state 字段判断优惠券是否可用
          available: coupon.state === 0,
        }));
      },
      forceRefetch: () => true,
      providesTags: [tagTypes.Coupon],
    }),
    /**
     * @description 应用优惠券到订单
     * @param {object} params
     * @param {string} params.orderNumber 订单号
     * @param {string} params.couponCode 优惠券代码
     * @returns {Order} 更新后的订单
     */
    applyCouponV2: builder.mutation<Order, { orderNumber: string; couponCode: string }>({
      query: ({ orderNumber, couponCode }) => ({
        url: `checkouts/${orderNumber}/coupon`,
        method: 'POST',
        body: {
          coupon_code: couponCode,
        },
      }),
      invalidatesTags: [tagTypes.Coupon],
    }),

    /**
     * @description 从订单中移除优惠券
     * @param {object} params
     * @param {string} params.orderNumber 订单号
     * @param {string} params.couponCode 优惠券代码
     * @returns {Order} 更新后的订单
     */
    removeCouponV2: builder.mutation<Order, { orderNumber: string; couponCode: string }>({
      query: ({ orderNumber, couponCode }) => ({
        url: `checkouts/${orderNumber}/coupon`,
        method: 'DELETE',
        body: {
          coupon_code: couponCode,
        },
      }),
      invalidatesTags: [tagTypes.Coupon],
    }),
  }),
});

// 导出 hooks 供函数组件使用
export const { useGetCouponsByOrderNumberV2Query, useApplyCouponV2Mutation, useRemoveCouponV2Mutation } = couponApi;

// 导出 endpoints 供 SSR 使用
export const { getCouponsByOrderNumberV2, applyCouponV2, removeCouponV2 } = couponApi.endpoints;
