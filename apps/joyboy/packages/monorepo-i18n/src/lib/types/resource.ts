import { LocalesNamespace } from './namescape';

// import all namespaces (for the default language, only)
import CartTranslation from '../locales/modules/cart/en-SG.json';
import CheckoutTranslation from '../locales/modules/checkout/en-SG.json';
import OrderTranslation from '../locales/modules/order/en-SG.json';
import ProductTranslation from '../locales/modules/product/en-SG.json';
import PromotionTranslation from '../locales/modules/promotion/en-SG.json';
import UserTranslation from '../locales/modules/user/en-SG.json';
import SharedTranslation from '../locales/shared/en-SG.json';
import ErrorTranslation from '../locales/error/en-SG.json';

export type SharedResource = typeof SharedTranslation;
export type CartResource = typeof CartTranslation;
export type OrderResource = typeof OrderTranslation;
export type UserResource = typeof UserTranslation;
export type ProductResource = typeof ProductTranslation;
export type CheckoutResource = typeof CheckoutTranslation;
export type PromotionResource = typeof PromotionTranslation;
export type ErrorResource = typeof ErrorTranslation;

export type Resource = {
  [LocalesNamespace.SHARED]: SharedResource;
  [LocalesNamespace.MODULES_CART]: CartResource;
  [LocalesNamespace.MODULES_CHECKOUT]: CheckoutResource;
  [LocalesNamespace.MODULES_USER]: UserResource;
  [LocalesNamespace.MODULES_ORDER]: OrderResource;
  [LocalesNamespace.MODULES_PRODUCT]: ProductResource;
  [LocalesNamespace.MODULES_PROMOTION]: PromotionResource;
  [LocalesNamespace.ERROR]: ErrorResource;
};
