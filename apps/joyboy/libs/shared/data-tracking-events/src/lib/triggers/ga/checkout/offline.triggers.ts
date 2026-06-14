import { baseCheckout, type BaseCheckoutArgs, type BaseCheckoutDataLayer } from './base-checkout.trigger';

export const offlineCheckout = (args: BaseCheckoutArgs): BaseCheckoutDataLayer => baseCheckout(args);
