/* Instruments */
/* eslint-disable */
import { EcEnv, enableWarranty } from '@castlery/config';
import { retailSlice } from '@castlery/modules-retails-domain';
import {
  adminSlice,
  authSlice,
  customerSlice,
  saleListSlice,
  userSlice,
  wishlistSlice,
  customerAddressSlice,
  zipcodeSlice,
  posUmsPermissionSlice,
  umsUserInfoSlice,
} from '@castlery/modules-user-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { orderSlice, serviceSlice, orderHistorySlice, orderV1Slice } from '@castlery/modules-order-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  autoCompleteListSlice,
  productCompleteListSlice,
  productListSlice,
  productOptionSlice,
  productSlice,
  reviewsSlice,
  shopTheLookSlice,
  stripeSlice,
  warrantySlice,
} from '@castlery/modules-product-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { couponSlice, promotionSlice, yotpoSlice } from '@castlery/modules-promotion-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { checkoutSlice, checkoutSessionSlice } from '@castlery/modules-checkout-domain';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { api, apiV1, dyApi, dyCollectApi, searchApi, yotpoBaseApi } from '@castlery/shared-redux-services';
// eslint-disable-next-line
import { cmsSlice } from '@castlery/modules-cms-domain';
import { cartSlice } from '@castlery/modules-cart-domain';
import { paySlice } from '@castlery/modules-payment-domain';

import { dySlice } from '@castlery/modules-dy-domain';

export const reducer = {
  [api.reducerPath]: api.reducer,
  [apiV1.reducerPath]: apiV1.reducer,
  [searchApi.reducerPath]: searchApi.reducer,
  [yotpoBaseApi.reducerPath]: searchApi.reducer,
  [dyApi.reducerPath]: dyApi.reducer,
  [dyCollectApi.reducerPath]: dyCollectApi.reducer,
  [productSlice.reducerPath]: productSlice.reducer,
  [productListSlice.reducerPath]: productListSlice.reducer,
  [stripeSlice.reducerPath]: stripeSlice.reducer,
  [authSlice.reducerPath]: authSlice.reducer,
  [zipcodeSlice.reducerPath]: zipcodeSlice.reducer,
  [orderSlice.reducerPath]: orderSlice.reducer,
  [orderV1Slice.reducerPath]: orderV1Slice.reducer,
  [productOptionSlice.reducerPath]: productOptionSlice.reducer,
  [serviceSlice.reducerPath]: serviceSlice.reducer,
  [checkoutSlice.reducerPath]: checkoutSlice.reducer,
  [checkoutSessionSlice.reducerPath]: checkoutSessionSlice.reducer,
  [saleListSlice.reducerPath]: saleListSlice.reducer,
  [autoCompleteListSlice.reducerPath]: autoCompleteListSlice.reducer,
  [productCompleteListSlice.reducerPath]: productCompleteListSlice.reducer,
  [cmsSlice.reducerPath]: cmsSlice.reducer,
  [dySlice.reducerPath]: dySlice.reducer,
  [customerSlice.reducerPath]: customerSlice.reducer,
  [promotionSlice.reducerPath]: promotionSlice.reducer,
  [yotpoSlice.reducerPath]: yotpoSlice.reducer,
  [customerAddressSlice.reducerPath]: customerAddressSlice.reducer,
  // ------------------- Cart Start -----------------
  [cartSlice.reducerPath]: cartSlice.reducer,
  // ------------------- Cart End -----------------
  [couponSlice.reducerPath]: couponSlice.reducer,
  [orderHistorySlice.reducerPath]: orderHistorySlice.reducer,
  [paySlice.reducerPath]: paySlice.reducer,
  ...(EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' && {
    [retailSlice.reducerPath]: retailSlice.reducer,
    [adminSlice.reducerPath]: adminSlice.reducer,
    [posUmsPermissionSlice.reducerPath]: posUmsPermissionSlice.reducer,
    [umsUserInfoSlice.reducerPath]: umsUserInfoSlice.reducer,
  }),
  ...(EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB' && {
    [userSlice.reducerPath]: userSlice.reducer,
    [wishlistSlice.reducerPath]: wishlistSlice.reducer,
    [reviewsSlice.reducerPath]: reviewsSlice.reducer,
    [shopTheLookSlice.reducerPath]: shopTheLookSlice.reducer,
  }),
  // ...(enableWarranty && {
  [warrantySlice.reducerPath]: warrantySlice.reducer,
  // }),
};
