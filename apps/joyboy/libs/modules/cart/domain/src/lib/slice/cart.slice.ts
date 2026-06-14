import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { PayloadAction, createEntityAdapter } from '@reduxjs/toolkit';
import type { ProsuroWidgetCartItem } from '@castlery/config';
import type {
  CartDataSchema,
  SummarySchema,
  LineItemSchema,
  LineItemBundleLineItemSchema,
  GiftLineItemSchema,
} from '@castlery/types';
import { updateCartItemQty, addLineItemToCart, removeCartItem, cartUndoAction } from '../api/cart-item.api';
import { getCartItemsCount, refreshCart, updateZipcodeInCart, initCheckout, getCartData } from '../api/cart.api';
import { addWarranty, removeWarranty } from '../api/warranty.api';
import { getWebCartLineItems, manualSetDiscount, overWriteServicePrice } from '../api/cart-pos.api';

export const CART_FEATURE_KEY = 'cart';

export const checkoutAdapter = createEntityAdapter<{
  cart: CartDataSchema | null;
  cartLineItems: LineItemSchema[];
  cartSummary: SummarySchema | null;
  id: string;
  [property: string]: any;
}>({});
export interface CartItemState {
  xCartToken: string;
  cartItemCount: number;
  cartRoot: CartDataSchema | null;
  miniCartMode: boolean; // 是否是mini cart
  initialCartLoading: boolean;
  // 读写操作组合的loading状态
  qtyActionLoading: boolean; //qty action & query line items
  refreshLoading: boolean; //refresh cart
  addToCartLoading: boolean; //add to cart
  recordRemovedItem: LineItemSchema | null;
  showRemoveUndoToast: boolean;
  removeItemLoading: boolean;
  warrantyLoading: boolean;
  zipcodeLoading: boolean;
  removeUndoToastLoading: boolean;
  checkoutLoading: boolean;
  reloadCartLoading: boolean;
  posOnlineCart: CartDataSchema | null;
  discountActionLoading: boolean;
  guardsmanCartItems: Record<string, ProsuroWidgetCartItem>;
}
export const initialCartItemState: CartItemState = checkoutAdapter.getInitialState({
  xCartToken: '',
  cartItemCount: 0,
  cartRoot: null,
  qtyActionLoading: false,
  refreshLoading: false,
  miniCartMode: false,
  addToCartLoading: false,
  recordRemovedItem: null,
  showRemoveUndoToast: false,
  removeItemLoading: false,
  warrantyLoading: false,
  zipcodeLoading: false,
  removeUndoToastLoading: false,
  checkoutLoading: false,
  reloadCartLoading: false,
  posOnlineCart: null,
  initialCartLoading: false,
  discountActionLoading: false,
  guardsmanCartItems: {},
});

export const cartSlice = createSliceWithThunks({
  name: CART_FEATURE_KEY,
  initialState: initialCartItemState,
  reducers: (create) => ({
    setCartRoot: create.reducer((state, { payload }: PayloadAction<CartDataSchema>) => {
      state.cartRoot = payload;
    }),
    setXCartToken: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.xCartToken = payload;
    }),
    updateMiniCartMode: create.reducer((state, { payload }: PayloadAction<boolean>) => {
      state.miniCartMode = payload;
    }),
    updateRecordRemovedItem: create.reducer((state, { payload }: PayloadAction<LineItemSchema>) => {
      state.recordRemovedItem = payload;
    }),
    updateShowRemoveUndoToast: create.reducer((state, { payload }: PayloadAction<boolean>) => {
      state.showRemoveUndoToast = payload;
    }),
    updateInitialCartLoading: create.reducer((state, { payload }: PayloadAction<boolean>) => {
      state.initialCartLoading = payload;
    }),
    updateReloadCartLoading: create.reducer((state, { payload }: PayloadAction<boolean>) => {
      state.reloadCartLoading = payload;
    }),
    setGuardsmanCartItems: create.reducer(
      (state, { payload }: PayloadAction<Record<string, ProsuroWidgetCartItem>>) => {
        state.guardsmanCartItems = payload;
      }
    ),
    clearGuardsmanCartItems: create.reducer((state) => {
      state.guardsmanCartItems = {};
    }),
  }),
  extraReducers(builder) {
    builder.addMatcher(
      (action) => getCartData.matchFulfilled(action),
      (state, { payload }: PayloadAction<CartDataSchema>) => {
        state.cartRoot = payload;
      }
    );
    builder.addMatcher(
      (action) => updateCartItemQty.matchPending(action),
      (state) => {
        state.qtyActionLoading = true;
      }
    );
    builder.addMatcher(
      (action) => updateCartItemQty.matchRejected(action),
      (state) => {
        state.qtyActionLoading = false;
      }
    );
    builder.addMatcher(
      (action) => refreshCart.matchPending(action),
      (state) => {
        state.refreshLoading = true;
      }
    );
    builder.addMatcher(
      (action) => refreshCart.matchRejected(action),
      (state) => {
        state.refreshLoading = false;
      }
    );
    builder.addMatcher(
      (action) => initCheckout.matchPending(action),
      (state) => {
        state.checkoutLoading = true;
      }
    );
    builder.addMatcher(
      (action) => initCheckout.matchFulfilled(action) || initCheckout.matchRejected(action),
      (state) => {
        state.checkoutLoading = false;
      }
    );
    builder.addMatcher(
      (action) => getCartData.matchFulfilled(action) || getCartData.matchRejected(action),
      (state) => {
        state.qtyActionLoading = false;
        state.refreshLoading = false;
        state.addToCartLoading = false;
        state.removeItemLoading = false;
        state.warrantyLoading = false;
        state.zipcodeLoading = false;
        state.removeUndoToastLoading = false;
        state.discountActionLoading = false;
      }
    );
    builder.addMatcher(
      (action) => getCartItemsCount.matchFulfilled(action),
      (state, { payload }: PayloadAction<any>) => {
        state.cartItemCount = payload.count;
      }
    );
    builder.addMatcher(
      (action) => addLineItemToCart.matchRejected(action),
      (state) => {
        state.addToCartLoading = false;
      }
    );
    builder.addMatcher(
      (action) => addLineItemToCart.matchPending(action),
      (state) => {
        state.addToCartLoading = true;
      }
    );
    builder.addMatcher(
      (action) => removeCartItem.matchPending(action),
      (state) => {
        state.removeItemLoading = true;
      }
    );
    builder.addMatcher(
      (action) => removeCartItem.matchRejected(action),
      (state) => {
        state.removeItemLoading = false;
      }
    );
    builder.addMatcher(
      (action) => addWarranty.matchPending(action) || removeWarranty.matchPending(action),
      (state) => {
        state.warrantyLoading = true;
      }
    );
    builder.addMatcher(
      (action) => addWarranty.matchFulfilled(action) || removeWarranty.matchFulfilled(action),
      (state) => {
        state.warrantyLoading = false;
      }
    );
    builder.addMatcher(
      (action) => addWarranty.matchRejected(action) || removeWarranty.matchRejected(action),
      (state) => {
        state.warrantyLoading = false;
      }
    );
    builder.addMatcher(
      (action) => updateZipcodeInCart.matchPending(action),
      (state) => {
        state.zipcodeLoading = true;
      }
    );
    builder.addMatcher(
      (action) => updateZipcodeInCart.matchRejected(action),
      (state) => {
        state.zipcodeLoading = false;
      }
    );
    builder.addMatcher(
      (action) => cartUndoAction.matchPending(action),
      (state) => {
        state.removeUndoToastLoading = true;
      }
    );
    builder.addMatcher(
      (action) => getWebCartLineItems.matchFulfilled(action),
      (state, { payload }: PayloadAction<CartDataSchema>) => {
        state.posOnlineCart = payload;
      }
    );
    builder.addMatcher(
      (action) => getWebCartLineItems.matchRejected(action),
      (state) => {
        //由于pos是多customer场景，getWebCartLineItems失败时，要清空posOnlineCart，避免用到上一个顾客的online cart数据
        state.posOnlineCart = null;
      }
    );
    builder.addMatcher(
      (action) => manualSetDiscount.matchPending(action) || overWriteServicePrice.matchPending(action),
      (state) => {
        state.discountActionLoading = true;
      }
    );
    builder.addMatcher(
      (action) => manualSetDiscount.matchRejected(action) || overWriteServicePrice.matchRejected(action),
      (state) => {
        state.discountActionLoading = false;
      }
    );
  },
  selectors: {
    selectCartRoot: (state) => state.cartRoot,
    selectInitialCartLoading: (state) => state.initialCartLoading,
    selectCartItemsCount: (state) => state.cartRoot?.count || state.cartItemCount || 0,
    selectCartLineItems: (state) => {
      // 商品status = disabled，商品依然在购物车，只是用户不可见
      return state.cartRoot?.lineItems?.filter((item: LineItemSchema) => item.status !== 'disabled') || [];
    },
    selectCartServiceLineItems: (state) => state.cartRoot?.addOnServiceLineItems || [],
    selectCartGiftItems: (state) => state.cartRoot?.gifts || [],
    selectCartCustomizedItems: (state) => {
      const cartLineItems = state.cartRoot?.lineItems;
      return cartLineItems?.filter(
        (item: LineItemSchema) =>
          item.variant.isCustomized ||
          item.bundleLineItems?.some((bundleItem: LineItemBundleLineItemSchema) => bundleItem.variant.isCustomized)
      );
    },
    selectCartSummary: (state) => state.cartRoot?.summary || ({} as SummarySchema),
    selectCartCoupon: (state) => {
      const coupon = state.cartRoot?.summary?.coupon;
      return coupon || null;
    },
    selectCartCouponList: (state) => state.cartRoot?.summary?.couponList || [], // todo:看看是否需要移除
    selectGiftPools: (state) => state.cartRoot?.summary?.giftPools || [],
    selectAvailableCartCoupons: (state) => {
      const couponList = state.cartRoot?.summary?.couponList;
      return Array.isArray(couponList) ? couponList.filter((coupon) => coupon.state === 0) : [];
    },
    selectCartZipcode: (state) => state.cartRoot?.zipcode,
    selectCartApplyWithOriginalPrice: (state) => state.cartRoot?.summary?.applyWithOriginalPrice || false,
    selectCartQtyActionLoading: (state) => state.qtyActionLoading,
    selectRefreshLoading: (state) => state.refreshLoading,
    selectMiniCartMode: (state) => state.miniCartMode,
    selectAddToCartLoading: (state) => state.addToCartLoading,
    selectRemoveItemLoading: (state) => state.removeItemLoading,
    selectShowRemoveUndoToast: (state) => state.showRemoveUndoToast,
    selectRemoveUndoToastLoading: (state) => state.removeUndoToastLoading,
    selectRecordRemovedItem: (state) => state.recordRemovedItem,
    selectCartActionLoading: (state) => {
      return (
        state.refreshLoading ||
        state.addToCartLoading ||
        state.qtyActionLoading ||
        state.removeItemLoading ||
        state.discountActionLoading ||
        state.warrantyLoading
      );
    },
    selectLineItemsAndServiceLineItems: (state) => {
      return [...(state.cartRoot?.lineItems || []), ...(state.cartRoot?.addOnServiceLineItems || [])];
    },
    selectCheckoutDisabled: (state) => {
      // prd: https://castlery.atlassian.net/wiki/x/W4DVsw
      const { summary, lineItems, gifts, addOnServiceLineItems } = state.cartRoot ?? {};

      const hasSummary = summary && Object.keys(summary).length > 0;

      const isLineItemAbnormal = (item: LineItemSchema) =>
        item.status !== 'enabled' || item.isDeleted || item.isPriceOutdated || item.isRegionOutdated || !item.isActive;

      const isGiftAbnormal = (gift: GiftLineItemSchema) =>
        !gift.isEligible || !gift.isActive || gift.isDeleted || gift.isRegionOutdated;

      const hasActiveLineItem =
        lineItems?.some((item) => item.isActive) || addOnServiceLineItems?.some((item) => item.isActive);

      const hasAbnormalStateItem =
        lineItems?.some(isLineItemAbnormal) || addOnServiceLineItems?.some((item) => !item.isActive);

      const hasAbnormalStateGift = gifts?.some(isGiftAbnormal);

      return !hasSummary || !hasActiveLineItem || !!hasAbnormalStateItem || !!hasAbnormalStateGift;
    },
    selectCheckoutLoading: (state) => {
      return (
        state.checkoutLoading ||
        state.refreshLoading ||
        state.addToCartLoading ||
        state.qtyActionLoading ||
        state.removeItemLoading ||
        state.discountActionLoading
      );
    },
    selectWarrantyLoading: (state) => state.warrantyLoading,
    selectGuardsmanCartItems: (state) => state.guardsmanCartItems,
    selectZipcodeLoading: (state) => state.zipcodeLoading,
    selectReloadCartLoading: (state) => state.reloadCartLoading,
    selectHasItemsInWebCart: (state) => {
      const cartLineItems = state.cartRoot?.lineItems;
      const cartGiftItems = state.cartRoot?.gifts;
      const hasItemsInCart =
        (Array.isArray(cartLineItems) && cartLineItems.length > 0) ||
        (Array.isArray(cartGiftItems) && cartGiftItems.length > 0);
      return hasItemsInCart;
    },
    selectPosOnlineCartItems: (state) => state.posOnlineCart?.lineItems || [],
  },
});

export const {
  setCartRoot,
  setXCartToken,
  updateMiniCartMode,
  // ================== For Cart Root ==================
  updateRecordRemovedItem,
  updateShowRemoveUndoToast,
  updateInitialCartLoading,
  updateReloadCartLoading,
  setGuardsmanCartItems,
  clearGuardsmanCartItems,
} = cartSlice.actions;

export const {
  selectCartRoot,
  // ================== For Cart Root ==================
  selectCartLineItems,
  selectCartSummary,
  selectCartCoupon,
  selectCartCouponList,
  selectAvailableCartCoupons,
  selectCartZipcode,
  selectCartQtyActionLoading,
  selectRefreshLoading,
  selectMiniCartMode,
  selectCartItemsCount,
  selectAddToCartLoading,
  selectShowRemoveUndoToast,
  selectRemoveUndoToastLoading,
  selectRecordRemovedItem,
  selectCheckoutDisabled,
  selectCheckoutLoading,
  selectCartCustomizedItems,
  selectCartGiftItems,
  selectWarrantyLoading,
  selectGuardsmanCartItems,
  selectZipcodeLoading,
  selectInitialCartLoading,
  selectReloadCartLoading,
  selectGiftPools,
  selectRemoveItemLoading,
  selectHasItemsInWebCart,
  selectCartActionLoading,
  selectLineItemsAndServiceLineItems,
  selectCartApplyWithOriginalPrice,
  // ========== For Pos
  selectPosOnlineCartItems,
  selectCartServiceLineItems,
} = cartSlice.selectors;
