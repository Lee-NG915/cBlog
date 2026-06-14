import { EcEnv } from '@castlery/config';

const isSG = EcEnv.NEXT_PUBLIC_COUNTRY === 'SG';

export const outdatedHelperText = (is_price_outdated: boolean) => {
  return is_price_outdated
    ? 'Sorry, the price of this product is outdated. Please refresh the cart in order to check out.'
    : isSG
    ? 'Sorry, this product is out of stock. Please remove it in order to check out.'
    : 'Sorry, this product is out of stock for your selected shipping region. Please remove it in order to check out.';
};

/**
 * 计算商品划线价
 * @param {*} item
 * @returns
 */
export const calcItemStrikeThroughPrice = (item: any) => {
  if (!item || Object.keys(item).length === 0) return '';
  // 注意bundle商品划线价计算方式
  const number =
    item.product_type === 'bundle'
      ? Array.isArray(item.bundle_line_items)
        ? item.bundle_line_items.reduce(
            (acr, cur) =>
              acr + ((+Number(cur.variant?.list_price) || 0) * (+cur.quantity || 1) || 0) * (item.quantity || 1),
            0
          )
        : 0
      : (+item.variant?.list_price || 0) * (+item.quantity || 1) || null;
  return number;
};
