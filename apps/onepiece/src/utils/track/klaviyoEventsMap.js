import { getBreadcrumbNames, getCheckoutUrl, getItemsForKlaviyo, getProductImageUrl, getProductUrl } from './common';
import { EVENT_VARIANT_DETAIL, EVENT_CART_PROCESS, EVENT_CHECKOUT, EVENT_IDENTIFY } from './constants';

function identify(action, preState, nextState) {
  const { auth } = nextState;
  if (auth.user) {
    const { email, firstname, lastname } = auth.user;
    return {
      data: [
        'identify',
        {
          $email: email,
          $first_name: firstname,
          $last_name: lastname,
        },
      ],
    };
  }
  return null;
}
function variantDetail(action, preState, nextState) {
  const { products, productOptions } = nextState;
  const { variantId, productSlug } = productOptions;
  const product = products[productSlug]?.data;
  if (!product) return;
  const variant = product?.variants.find((v) => v.id === variantId);
  const { taxons } = product;
  const {
    id,
    sku,
    price,
    list_price: listPrice,
    product_taxons: productTaxons,
    images,
    product_name: productName,
  } = variant;
  const [pageName, subPageName] = getBreadcrumbNames(taxons || productTaxons);
  return {
    data: [
      'track',
      'Viewed Product',
      {
        ProductName: productName,
        ProductID: id,
        SKU: sku,
        Categories: [pageName, subPageName],
        ImageURL: getProductImageUrl(images),
        URL: getProductUrl(variant, productSlug),
        Brand: 'Castlery',
        Price: +price,
        CompareAtPrice: +listPrice,
      },
    ],
  };
}

function cartProcess(action, preState, nextState) {
  const { isSwatch, variant, preCart, isIncreased } = action.result;
  const { data: nextCart } = nextState.cart;
  if (__COUNTRY__ === 'SG') {
    return null;
  }

  if (isSwatch) {
    return null;
  }
  if (isIncreased) {
    const targetCart = isIncreased ? nextCart : preCart;
    const items = getItemsForKlaviyo(targetCart?.line_items);
    const targetItem = targetCart?.line_items.find((lineItem) => lineItem.variant.id === variant.id);
    const {
      id,
      sku,
      price,
      qty_increments: qtyIncrements,
      product_taxons: productTaxons,
      images,
      product_slug: productSlug,
      product_name: productName,
    } = targetItem?.variant || {};
    const addedItem = {
      AddedItemProductName: productName,
      AddedItemProductID: id,
      AddedItemSKU: sku,
      AddedItemPrice: +price,
      AddedItemQuantity: qtyIncrements,
      AddedItemCategories: getBreadcrumbNames(productTaxons),
      ProductURL: getProductUrl(targetItem?.variant, productSlug),
      ImageURL: getProductImageUrl(images),
    };
    return {
      data: [
        'track',
        'Added to Cart',
        {
          // eslint-disable-next-line no-unsafe-optional-chaining
          $value: +targetCart?.item_total,
          ItemNames: items.map((item) => item.ProductName),
          CheckoutURL: getCheckoutUrl(),
          ...addedItem,
          Items: items,
        },
      ],
    };
  }
  return null;
}

export function checkout(action, preState, nextState) {
  const { checkoutStep } = action.result;
  if (__COUNTRY__ === 'SG') {
    return null;
  }

  if (checkoutStep === 1) {
    const { cart } = nextState;
    const { data: order } = cart;
    const { id, line_items: lineItems, item_total: itemTotal } = order;
    const items = getItemsForKlaviyo(lineItems);
    const categorySet = items.reduce((set, item) => {
      item.ProductCategories.forEach((category) => {
        set.add(category);
      });
      return set;
    }, new Set());
    const categories = Array.from(categorySet);
    return {
      data: [
        'track',
        'Started Checkout',
        {
          $event_id: `${id}_${Date.now()}`,
          $value: +itemTotal,
          ItemNames: items.map((item) => item.ProductName),
          CheckoutURL: getCheckoutUrl(),
          Categories: categories,
          Items: items,
        },
      ],
    };
  }
  return null;
}
export default {
  [EVENT_IDENTIFY]: identify,
  [EVENT_VARIANT_DETAIL]: variantDetail,
  [EVENT_CART_PROCESS]: cartProcess,
  [EVENT_CHECKOUT]: checkout,
};
