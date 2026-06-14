import { EcEnv, basePageConfig } from '@castlery/config';

export type CheckoutPaths = {
  cart: string;
  address: string;
  method: string;
};

export const getCheckoutPaths = (): CheckoutPaths => {
  const countryPrefix = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`;
  return {
    cart: `${countryPrefix}${basePageConfig.cart}`,
    address: `${countryPrefix}${basePageConfig['checkout-shipping-address']}`,
    method: `${countryPrefix}${basePageConfig['checkout-shipping-method']}`,
  };
};
