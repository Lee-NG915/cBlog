import { KlMetrics } from '../../../metrics';
// import { __CURRENCY__, __COUNTRY__ } from '../../../config/env';

export type Item = {
  ProductName: string;
};

export type AddedItem = Record<string, unknown>;

export type CartArray = [
  'track',
  KlMetrics.add_to_cart,
  {
    $value: number;
    ItemNames: string[];
    CheckoutURL: string;
    Items: Item[];
  } & AddedItem
];

//--------------------- todo -----------------------
//场景：
//1. 用户在PDP页面选择商品属性后点击加入购物车
//2. 用户在gift等页面点击加入购物车
//3. 用户在购物车页面修改购物车数据
//4. 点击结算才会触发 abandon cart

// function cartProcess(action, preState, nextState) {
//   const { isSwatch, variant, preCart, isIncreased } = action.result;
//   const { data: nextCart } = nextState.cart;
//   if (__COUNTRY__ === 'SG') {
//     return null;
//   }

//   // if (isSwatch) {
//   //   return null;
//   // }
//   // if (isIncreased) {
//   //   const targetCart = isIncreased ? nextCart : preCart;
//   //   const items = getItemsForKlaviyo(targetCart?.line_items);
//   //   const targetItem = targetCart?.line_items.find((lineItem) => lineItem.variant.id === variant.id);
//   //   const {
//   //     id,
//   //     sku,
//   //     price,
//   //     qty_increments: qtyIncrements,
//   //     product_taxons: productTaxons,
//   //     images,
//   //     product_slug: productSlug,
//   //     product_name: productName,
//   //   } = targetItem?.variant || {};
//   //   const addedItem = {
//   //     AddedItemProductName: productName,
//   //     AddedItemProductID: id,
//   //     AddedItemSKU: sku,
//   //     AddedItemPrice: +price,
//   //     AddedItemQuantity: qtyIncrements,
//   //     AddedItemCategories: getBreadcrumbNames(productTaxons),
//   //     ProductURL: getProductUrl(targetItem?.variant, productSlug),
//   //     ImageURL: getProductImageUrl(images),
//   //   };
//   //   return {
//   //     data: [
//   //       'track',
//   //       'Added to Cart',
//   //       {
//   //         // eslint-disable-next-line no-unsafe-optional-chaining
//   //         $value: +targetCart?.item_total,
//   //         ItemNames: items.map((item) => item.ProductName),
//   //         CheckoutURL: getCheckoutUrl(),
//   //         ...addedItem,
//   //         Items: items,
//   //       },
//   //     ],
//   //   };
//   // }
//   // return null;
// }
