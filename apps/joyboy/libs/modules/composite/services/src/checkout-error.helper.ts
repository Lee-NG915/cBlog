import { isAnyOf } from '@reduxjs/toolkit';
import {
  getCheckoutInfo,
  updateCheckoutAddressZipcode,
  validateAddressForShippingAndUpdate,
  validateCheckoutAddress,
  updateCheckoutShippingMethod,
  getCheckoutAddressList,
  generateQuotation,
} from '@castlery/modules-checkout-domain';
import { initCheckout } from '@castlery/modules-cart-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { updateCustomerAddressV2, createCustomerAddressV2 } from '@castlery/modules-user-domain';
import { TransactionApiErrorCode, basePageConfig, EcEnv, accessInWeb, accessInPos } from '@castlery/config';
import type { AppDispatch } from '@castlery/shared-redux-store';
import { globalDefaultCity, posRoutes } from '@castlery/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { createTransactionOrder } from '@castlery/modules-order-domain';
import { checkoutRemoveCouponFromCart } from '@castlery/modules-promotion-domain';

const webCartPath = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig.cart}`;
const posCartPath = posRoutes.products;

const webCheckoutAccountPath = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/${
  basePageConfig['checkout-account']
}`;
const webCheckoutAddressPath = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/${
  basePageConfig['checkout-shipping-address']
}`;
const webCheckoutMethodPath = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/${
  basePageConfig['checkout-shipping-method']
}`;
export const UpdateCheckoutAddressZipcodeFailedEvent = updateCheckoutAddressZipcode.matchRejected;

export const CheckoutProcessFailedEvent = isAnyOf(
  initCheckout.matchRejected,
  getCheckoutInfo.matchRejected,
  validateAddressForShippingAndUpdate.matchRejected,
  validateCheckoutAddress.matchRejected,
  updateCustomerAddressV2.matchRejected,
  createCustomerAddressV2.matchRejected,
  updateCheckoutShippingMethod.matchRejected,
  checkoutRemoveCouponFromCart.matchRejected,
  createTransactionOrder.matchRejected,
  generateQuotation.matchRejected
);

export const needRefreshCartOrRedirectToCartCodes = [
  TransactionApiErrorCode.ErrCheckoutCacheExpiration, // 10702041
  TransactionApiErrorCode.ErrCheckoutLatestSalePriceNotEqualToCartPrice, // 10702003
  TransactionApiErrorCode.ErrCheckoutMultipleItemsLatestSalePriceNotEqualToCartPrice, // 10702013
  TransactionApiErrorCode.ErrCheckoutSwatchMoreThanThree, // 10702004
  TransactionApiErrorCode.ErrCheckoutSwatchOneOrderInThePastTwoWeeks, // 10702020
  TransactionApiErrorCode.ErrCheckoutSingleSwatchMoreThanTwo, // 10702019
  TransactionApiErrorCode.ErrCheckoutDeletedItem, // 10702000
  TransactionApiErrorCode.ErrCheckoutMultipleItemsDeletedItem, // 10702010
  TransactionApiErrorCode.ErrCheckoutItemNotEnabled, // 10702002
  TransactionApiErrorCode.ErrCheckoutMultipleItemsNotEnabled, // 10702011
  TransactionApiErrorCode.ErrCheckoutTerminalNotForSale, // 10702001
  TransactionApiErrorCode.ErrCheckoutMultipleItemsTerminalNotForSale, // 10702012
  TransactionApiErrorCode.ErrCheckoutMoreThanMaxSaleQty, // 10702005
  TransactionApiErrorCode.ErrCheckoutMultipleItemsMoreThanMaxSaleQty, // 10702014
  TransactionApiErrorCode.ErrCheckoutLessThanMinSaleQty, // 10702006
  TransactionApiErrorCode.ErrCheckoutMultipleItemsLessThanMinSaleQty, // 10702015
  TransactionApiErrorCode.ErrCheckoutUnequalQtyIncrements, // 10702007
  TransactionApiErrorCode.ErrCheckoutMultipleItemsUnequalQtyIncrements, // 10702016
  TransactionApiErrorCode.ErrCheckoutItemOutOfStock, // 10702008
  TransactionApiErrorCode.ErrCheckoutMultipleItemsOutOfStock, // 10702017
  TransactionApiErrorCode.ErrItemNotEnabled, // 10701015,
  TransactionApiErrorCode.ErrOrderIMSNotEnoughInventory, // 10703012
  TransactionApiErrorCode.ErrCheckoutCheckoutTokenExpired, // 10702035
  TransactionApiErrorCode.ErrOrderWarrantyInvalid, // 10703050
  TransactionApiErrorCode.ErrCheckoutTokenMissing, // 10702042
  TransactionApiErrorCode.ErrCheckoutReturnToCart, // 10702043
];

export const needRefreshCartOrReloadCheckoutInfoGroups = [
  TransactionApiErrorCode.ErrCheckoutCouponInvalid, // 10702025
  TransactionApiErrorCode.ErrCheckoutPromotionAmountChanged, // 10702026
];

// Kept for backward compatibility; codes have been consolidated into needRefreshCartOrRedirectToCartCodes
export const needRedirectToCartOnCloseModalGroup: number[] = [];

export const needListingItemsGroups = [
  TransactionApiErrorCode.ErrCheckoutDeletedItem, // 10702000
  TransactionApiErrorCode.ErrCheckoutMultipleItemsDeletedItem, // 10702010
  TransactionApiErrorCode.ErrCheckoutTerminalNotForSale, // 10702001
  TransactionApiErrorCode.ErrCheckoutMultipleItemsTerminalNotForSale, // 10702012
  TransactionApiErrorCode.ErrCheckoutItemNotEnabled, // 10702002
  TransactionApiErrorCode.ErrCheckoutMultipleItemsNotEnabled, // 10702011
  TransactionApiErrorCode.ErrCheckoutLatestSalePriceNotEqualToCartPrice, // 10702003
  TransactionApiErrorCode.ErrCheckoutMultipleItemsLatestSalePriceNotEqualToCartPrice, // 10702013
  TransactionApiErrorCode.ErrCheckoutMoreThanMaxSaleQty, // 10702005
  TransactionApiErrorCode.ErrCheckoutMultipleItemsMoreThanMaxSaleQty, // 10702014
  TransactionApiErrorCode.ErrCheckoutLessThanMinSaleQty, // 10702006
  TransactionApiErrorCode.ErrCheckoutMultipleItemsLessThanMinSaleQty, // 10702015
  TransactionApiErrorCode.ErrCheckoutUnequalQtyIncrements, // 10702007
  TransactionApiErrorCode.ErrCheckoutMultipleItemsUnequalQtyIncrements, // 10702016
  TransactionApiErrorCode.ErrCheckoutItemOutOfStock, // 10702008
  TransactionApiErrorCode.ErrCheckoutMultipleItemsOutOfStock, // 10702017
];
// Jump to ‘/checkout/account’ page
// Jump back to Cart page after having signed up or logged in
export const needJumpToCheckoutAccountCodes = [
  TransactionApiErrorCode.ErrCheckoutNotLogin, //  10702033
];
export const needReloadCheckoutAddressesCodes = [
  TransactionApiErrorCode.ErrAddressIsDeleted, // 10702038
];

// https://castlery.atlassian.net/wiki/x/YoCYuQ
export const checkoutZipcodeErrorCodes = [
  TransactionApiErrorCode.ErrZipCodeNotInDeliveryArea, // 10702036, address 和payment页行为不一致
];

export const needReplaceToMethodPageCodes = [
  TransactionApiErrorCode.ErrOrderIMSExpectedLeadTimeChanged, // 10703018
];

export const needRefreshCheckoutPromotionCodes = [
  TransactionApiErrorCode.ErrOrderPromotionIsChanged, // 10703021
];

export const checkoutHandlersMap = {
  redirectToCart: () => {
    if (accessInWeb) {
      window.location.href = webCartPath;
    }
    if (accessInPos) {
      // @color 处理pos的 redirect handler，需要确认 刷新或是重定向到discover页面，，因为重定向的话，会需要重新进入结算流程
      window.location.href = posCartPath;
    }
  },
  reloadCheckoutInfo: async (dispatch: AppDispatch) => {
    await dispatch(getCheckoutInfo.initiate(undefined, { forceRefetch: true }));
  },
  reloadCheckoutAddressesList: async (dispatch: AppDispatch) => {
    await dispatch(getCheckoutAddressList.initiate(undefined));
  },
  goToCheckoutAccount: () => {
    if (accessInWeb) {
      window.location.href = webCheckoutAccountPath;
    } else {
      window.location.reload();
    }
  },
  updateCheckoutZipcodeAndRedirectToCheckoutAddress: async (dispatch: AppDispatch) => {
    if (accessInWeb) {
      await dispatch(
        updateCheckoutAddressZipcode.initiate(
          globalDefaultCity as unknown as { zipcode: string; city: string; countryState: string }
        )
      );
      window.location.replace(webCheckoutAddressPath);
    }
  },
  replaceToMethodPage: async (dispatch: AppDispatch) => {
    if (accessInWeb) {
      window.location.replace(webCheckoutMethodPath);
    } else {
      await dispatch(getCheckoutInfo.initiate({ noCache: true, needsShippingMethod: true }, { forceRefetch: true }));
    }
  },
  forceRefreshCheckoutBaseInfo: async (dispatch: AppDispatch) => {
    await dispatch(getCheckoutInfo.initiate({ noCache: true }, { forceRefetch: true }));
  },
};
