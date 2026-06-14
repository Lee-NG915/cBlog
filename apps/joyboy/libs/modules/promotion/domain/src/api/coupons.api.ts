import { api } from '@castlery/shared-redux-services';
import { X_CART_TOKEN, X_CHECKOUT_TOKEN, accessInPos } from '@castlery/config';

const transformResponseHandler = (response: any) => {
  if (response.code !== 0) {
    // 处理错误
    const errorMsg = JSON.stringify(response);
    throw new Error(errorMsg);
  }
  return response.data;
};
// Define a service using a base URL and expected endpoints
export const couponsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addCouponToCart: builder.mutation<
      {
        isValid: boolean;
        invalidReason: string;
      },
      string
    >({
      query: (couponCode) => ({
        url: accessInPos ? '/api/v1/pos/cart/coupon' : '/api/v1/cart/coupon',
        method: 'PUT',
        headers: {
          [X_CART_TOKEN]: 'true',
        },
        body: {
          couponCode,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    removeCouponFromCart: builder.mutation<void, void>({
      query: () => ({
        url: accessInPos ? '/api/v1/pos/cart/coupon' : '/api/v1/cart/coupon',
        method: 'DELETE',
      }),
      transformResponse: transformResponseHandler,
    }),
    checkoutAddCouponToCart: builder.mutation<
      {
        isValid: boolean;
        invalidReason: string;
      },
      string
    >({
      query: (couponCode) => ({
        url: accessInPos ? '/api/v1/pos/checkout/coupon' : '/api/v1/checkout/coupon',
        method: 'PUT',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
        body: {
          couponCode,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    checkoutRemoveCouponFromCart: builder.mutation<void, { couponCode: string }>({
      query: ({ couponCode }) => ({
        url: accessInPos ? '/api/v1/pos/checkout/coupon' : '/api/v1/checkout/coupon',
        method: 'DELETE',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
        body: {
          couponCode,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
  }),
});

export const {
  useAddCouponToCartMutation,
  useRemoveCouponFromCartMutation,
  useCheckoutAddCouponToCartMutation,
  useCheckoutRemoveCouponFromCartMutation,
} = couponsApi;

export const { addCouponToCart, removeCouponFromCart, checkoutAddCouponToCart, checkoutRemoveCouponFromCart } =
  couponsApi.endpoints;
