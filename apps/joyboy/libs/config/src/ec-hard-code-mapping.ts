import { EcEnv } from './ec-env';
export const EC_HARD_CODE_MAPPING = {
  CART: {
    CART_SUMMARY: {
      enabledShowSalesTax: ['US', 'CA'].includes(EcEnv.NEXT_PUBLIC_COUNTRY),
    },
  },
  COUPON: {
    CALCULATOR_TYPE: {
      ProductDiscount: 'ProductDiscount',
      OrderDiscount: 'OrderDiscount',
      FreeGift: 'FreeGift',
      FreeShipping: 'FreeShipping',
      FreeService: 'FreeService',
      Mixed: 'Mixed',
    },
  },
};
