import { EcEnv } from '@castlery/config';
//TODO: @abbywang23 优化配置项的处理方式， 配置API error translations
export const stockOutDatedTextConfig = {
  SG: 'Sorry, this product is out of stock. Please remove it in order to check out.',
  US: 'Sorry, this product is out of stock for your selected shipping region. Please remove it in order to check out.',
  AU: 'Sorry, this product is out of stock for your selected shipping region. Please remove it in order to check out.',
  CA: 'Sorry, this product is out of stock for your selected shipping region. Please remove it in order to check out.',
  UK: 'Sorry, this product is out of stock for your selected shipping region. Please remove it in order to check out.',
};

export const stockOutDatedText = stockOutDatedTextConfig[EcEnv.NEXT_PUBLIC_COUNTRY];

export const priceOutDatedText =
  'Sorry, the price of this item has changed. Please refresh your cart to continue with checkout.';
