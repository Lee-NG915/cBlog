import { enableBranch, enableO2O } from '@castlery/config';
import {
  addItemQuantity,
  addToOrder,
  adjustLineItemPrice,
  // applyCoupon,
  createAWebOrderByUserId,
  createPosOrder,
  createWebOrder,
  getWebOrderByCustomer,
  getWebOrderByOrderNumber,
  getWebOrderByUid,
  mergeOrder,
  orderItemsTransfer,
  overWriteServiceProductPrice,
  reduceItemQuantity,
  refreshPrice,
  // removeCoupon,
  removeLineItem,
  selectCartItems,
  selectCurrentOrderNumber,
  selectOrderLineItems,
  setOrder,
  type AdjustPriceApiPayload,
  type ATCApiPayload,
  type LineItem,
} from '@castlery/modules-order-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { selectedRetailId } from '@castlery/modules-retails-domain';
import { trackPushToOnline, trackRetrieveOnlineCart } from '@castlery/modules-tracking-services';
import { getCurrentAdmin, logout, selectedCustomerId } from '@castlery/modules-user-domain';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import type { RootState as OriginalRootState } from '@castlery/shared-redux-store';
import type { Order } from '@castlery/types';
import { createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { autoCouponMarked } from './coupon.helper';
import { logger } from '@castlery/observability/client';

interface RootState extends OriginalRootState {
  currentProduct?: {
    qty_increments?: number;
  };
}

let webOrderStatusChangePromise: Promise<Order | null> | null = null;

/**
 * change quantity of the item
 * @param type
 * @param itemId
 */
export const changeQuantityCommand = createAsyncThunk(
  'order/changeQuantityCommand',
  async ({ type, itemId }: { type: 'add' | 'reduce'; itemId: number }, { dispatch, getState, rejectWithValue }) => {
    const rootState = getState() as RootState;
    const orderNumber = selectCurrentOrderNumber(rootState);
    const item = rootState.order?.order?.line_items?.find((item: LineItem) => item.id === itemId);
    if (!orderNumber) {
      return rejectWithValue('[changeQuantityCommand]:order not found');
    }
    if (!item) {
      return rejectWithValue('[changeQuantityCommand]:item not found');
    }
    const warrantyOfferId = item.warranty_items?.warranty_offer_id;
    const payload = {
      orderNumber,
      lineItemId: itemId,
      quantity:
        type === 'add'
          ? item.quantity + item.variant?.qty_increments * 1
          : item.quantity - item.variant?.qty_increments * 1,
      options: warrantyOfferId
        ? {
            warranty_offer_id: warrantyOfferId,
          }
        : {},
    };

    const params = {
      orderNumber: payload.orderNumber,
      lineItemId: payload.lineItemId,
      quantity: payload.quantity,
      options: {
        warranty_offer_id: payload.options.warranty_offer_id,
      },
    };

    try {
      const action = type === 'add' ? addItemQuantity.initiate : reduceItemQuantity.initiate;
      return dispatch(action(params)).unwrap();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * remove the item from the cart
 */
export const removeItemCommand = createAsyncThunk(
  'order/removeItemCommand',
  async (itemId: number, { dispatch, getState, rejectWithValue }) => {
    const rootState = getState() as RootState;

    const orderNumber = selectCurrentOrderNumber(rootState);
    if (!orderNumber) {
      return rejectWithValue('[removeItemCommand]:order not found');
    }
    const res = await dispatch(removeLineItem.initiate({ orderNumber, lineItemId: itemId }));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

/**
 * manually adjust the price of item ,such as set discount
 */
export const adjustPriceCommand = createAsyncThunk(
  'order/adjustPriceCommand',
  async (payload: Omit<AdjustPriceApiPayload, 'orderNumber'>, { dispatch, getState, rejectWithValue }) => {
    const rootState = getState() as RootState;

    const orderNumber = selectCurrentOrderNumber(rootState);
    if (!orderNumber) {
      return rejectWithValue('[adjustPriceCommand]:order not found');
    }
    const res = await dispatch(adjustLineItemPrice.initiate({ ...payload, orderNumber }));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);
/**
 * transfer item between online-cart with pos-cart
 */
export const transferItemsCommand = createAsyncThunk(
  'order/transferItemsCommand',
  async ({ to, itemIds }: { to: 'web' | 'pos'; itemIds?: number[] }, { dispatch, getState, rejectWithValue }) => {
    const rootState = getState() as RootState;

    const orderNumber = selectCurrentOrderNumber(rootState);
    const webOrderNumber = rootState.order?.onlineOrder?.number;
    const toWeb = to === 'web';
    const toPos = to === 'pos';

    let result: number[] = [];
    if (toWeb) {
      const order = rootState.order?.order;
      result = order?.line_items?.map((item: LineItem) => item.id) || [];
    }
    if (toPos) {
      result = itemIds || [];
    }
    if (!result.length) {
      return rejectWithValue('[transferItemsCommand]:item not found');
    }

    let finalOrderNumber = toWeb ? webOrderNumber! : orderNumber!;
    if (!finalOrderNumber && toPos) {
      return rejectWithValue('Pos order not found');
    }
    if (!finalOrderNumber && toWeb) {
      const userId = selectedCustomerId(rootState) as number;
      const orderRes = await dispatch(createAWebOrderByUserId(userId));

      if ('error' in orderRes) {
        return rejectWithValue(orderRes.error);
      }
      if (!orderRes?.payload?.number) {
        return rejectWithValue('Web order not found');
      }
      finalOrderNumber = orderRes.payload.number;
    }
    if (toWeb) {
      await dispatch(trackPushToOnline(result));
    }
    if (toPos) {
      await dispatch(trackRetrieveOnlineCart(result));
    }
    const res = await dispatch(orderItemsTransfer.initiate({ number: finalOrderNumber, itemIds: result }));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

/**
 * apply coupon to order
 * use shared-services/promotion.helper.ts instead
 */
// export const applyCouponCommand = createAsyncThunk(
//   'order/applyCouponCommand',
//   async (payload: Omit<ApplyCouponApiPayload, 'number'>, { dispatch, getState, rejectWithValue }) => {
//     const rootState = getState() as RootState;
//     const orderNumber = selectCurrentOrderNumber(rootState);
//     if (!orderNumber) {
//       return rejectWithValue('[applyCouponCommand]:order not found');
//     }
//     let res: any;
//     if (ecPosFeatures.enabledNewPromotion ) {
//       res = await dispatch(applyCouponV2.initiate({ ...payload, orderNumber }));
//     } else {
//       res = await dispatch(applyCouponV1.initiate({ ...payload, number: orderNumber }));
//     }
//     if ('error' in res) {
//       return rejectWithValue(res.error);
//     }
//     return res.data;
//   }
// );

/**
 * add service into order
 */
export const addServiceCommand = createAsyncThunk(
  'order/addServiceCommand',
  async (payload: Omit<ATCApiPayload, 'number'>, { dispatch, getState, rejectWithValue }) => {
    const rootState = getState() as RootState;
    const orderNumber = selectCurrentOrderNumber(rootState);
    if (!orderNumber) {
      return rejectWithValue('[addServiceCommand]:order not found');
    }
    const res = await dispatch(addToOrder.initiate({ ...payload, number: orderNumber }));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

export const createPosOrderForCurrentAdmin = createAsyncThunk(
  'order/createPosOrderForCurrentAdmin',
  async (
    {
      errorAutoLogout = true,
    }: {
      errorAutoLogout?: boolean;
    },
    { dispatch, getState, rejectWithValue, extra }
  ) => {
    const rootState = getState() as RootState;
    const { persistenceHandles } = extra as ExtraArgument;

    const retailId = selectedRetailId(rootState) || Number(persistenceHandles.retailId.getItem());
    const { data } = await dispatch(getCurrentAdmin.initiate());
    const userId = data?.id;
    if ((!retailId && enableBranch) || !userId) {
      if (errorAutoLogout) {
        await dispatch(logout({}));
        return rejectWithValue('logout');
      }
      return rejectWithValue(
        `[createPosOrderForCurrentAdmin]:retailId or userId not found!retailId:${retailId},userId:${userId}`
      );
    }
    const res = await dispatch(createPosOrder.initiate({ retail_id: retailId, sales_user_id: userId }));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

// TODO 处理 loading
export const selectPushToOnlineBtnStatus = createSelector(
  [selectOrderLineItems, selectedCustomerId],
  (cartItems, customerId) => {
    const res = {
      disabled: true,
      loading: false,
    };
    if (cartItems && customerId) {
      res.disabled = !(cartItems.length > 0);
    }
    return res;
  }
);

// TODO 处理 loading
export const selectCheckoutBtnStatus = createSelector(
  [selectCartItems, selectedCustomerId],
  (cartItems, customerId) => {
    const res = {
      disabled: true,
      loading: false,
    };
    if (cartItems && customerId) {
      res.disabled = !(cartItems.length > 0);
    }
    return res;
  }
);

export const createANewPosOrder = createAsyncThunk('order/createANewPosOrder', async (_, { dispatch, extra }) => {
  const { persistenceHandles } = extra as ExtraArgument;
  persistenceHandles.orderNumber.removeItem();
  persistenceHandles.customerId.removeItem();
  persistenceHandles.city.removeItem();
  return await dispatch(createPosOrderForCurrentAdmin({})); // Fix: Pass an empty object as an argument
});

export const createWebOrderForCurrentUser = createAsyncThunk(
  'order/createWebOrderForCurrentUser',
  async (_, { dispatch, rejectWithValue }) => {
    const res = await dispatch(createWebOrder.initiate(undefined));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

/**
 * remove coupon from order
 * use shared-services/promotion.helper.ts instead
 */
// export const removeCouponCommand = createAsyncThunk(
//   'order/removeCouponCommand',
//   async (couponCode: string, { dispatch, getState, rejectWithValue, extra }) => {
//     const rootState = getState() as RootState;
//     const orderNumber = selectCurrentOrderNumber(rootState);
//     if (!orderNumber) {
//       return rejectWithValue('[removeCouponCommand]:order not found');
//     }
//     let res: any;
//     if (ecPosFeatures.enabledNewPromotion ) {
//       res = await dispatch(removeCouponV2.initiate({ orderNumber: orderNumber, couponCode: couponCode }));
//     } else {
//       res = await dispatch(removeCouponV1.initiate({ number: orderNumber, couponCode: couponCode }));
//     }
//     if ('error' in res) {
//       return rejectWithValue(res.error);
//     }
//     const { persistenceHandles } = extra as ExtraArgument;
//     const markedSymbol = autoCouponMarked(orderNumber, couponCode);
//     persistenceHandles.autoAppliedCoupon.setItem(markedSymbol);
//     return res.data;
//   }
// );

export const refreshCartCommand = createAsyncThunk(
  'order/refreshCartCommand',
  async (_, { dispatch, getState, rejectWithValue }) => {
    const rootState = getState() as RootState;
    const orderNumber = selectCurrentOrderNumber(rootState);
    if (!orderNumber) {
      return rejectWithValue('[refreshCartCommand]:order not found');
    }
    const res = await dispatch(refreshPrice.initiate(orderNumber));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

export const overWriteServiceItemPriceCommand = createAsyncThunk(
  'order/overWriteServiceItemPriceCommand',
  async (payload: { price: string; lineItemId: number }, { dispatch, getState, rejectWithValue }) => {
    const rootState = getState() as RootState;
    const orderNumber = selectCurrentOrderNumber(rootState);
    if (!orderNumber) {
      return rejectWithValue('[overWriteServiceItemPriceCommand]:order not found');
    }
    //price: number; lineItemId: number; number: string
    const res = await dispatch(
      overWriteServiceProductPrice.initiate({
        number: orderNumber,
        price: Number(payload.price),
        lineItemId: payload.lineItemId,
      })
    );
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

export const getWebOrderByUidCommand = createAsyncThunk(
  'order/getCurrentOrderByUidCommand',
  async (
    {
      forceRefetch = false,
    }: {
      forceRefetch?: boolean;
    } = {},
    { dispatch, getState, rejectWithValue }
  ) => {
    if (!enableO2O) {
      return Promise.resolve();
    }
    const rootState = getState() as RootState;
    const uid = selectedCustomerId(rootState);
    if (!uid) {
      logger.error('getCurrentOrderByUidCommand failed: uid not found', { uid });
      return rejectWithValue('[getCurrentOrderByUidCommand]:uid not found');
    }
    const res = await dispatch(
      getWebOrderByUid.initiate(uid, {
        forceRefetch,
      })
    );
    if ('error' in res) {
      return rejectWithValue(res.error);
    }

    return res.data;
  }
);

/**
 * 初始化/同步 web 订单状态（通常在用户登录或页面加载时触发）
 *
 * 核心逻辑：根据是否有 accessToken（登录态）以及 persistence 中是否存有
 * 游客 order（webOrderNumber + webOrderToken），决定如何获取或创建 web 订单，
 * 并在必要时将游客订单合并进已登录用户的订单。
 *
 * 决策树：
 *
 * ├─ [有 accessToken - 已登录]
 * │   ├─ 尝试拉取用户当前订单（getWebOrderByCustomer）
 * │   ├─ [有游客订单 webOrderNumber + webOrderToken]
 * │   │   ├─ 清除 persistence 中的游客 order 信息
 * │   │   ├─ [用户已有订单]
 * │   │   │   └─ 若订单号不同且未合并过 → 合并游客订单到用户订单
 * │   │   └─ [用户无订单]
 * │   │       └─ 创建新 web 订单 → 若未合并过 → 合并游客订单到新订单
 * │   └─ [无游客订单]
 * │       ├─ [用户已有订单] → 更新 persistence 中的 order id
 * │       └─ [用户无订单]  → 清除 persistence，创建新 web 订单
 * │
 * └─ [无 accessToken - 游客]
 *     ├─ [有游客订单 webOrderNumber + webOrderToken]
 *     │   └─ 按订单号查询订单；若查询失败或订单不存在 → 清除 persistence
 *     └─ [无游客订单] → 无需处理
 *
 * 最终若获取到 orderData，dispatch setOrder 更新 Redux 中的订单状态。
 */
export const changeWebOrderStatusCommand = createAsyncThunk(
  'order/changeWebOrderStatusCommand',
  async (_, { dispatch, extra, getState }) => {
    if (webOrderStatusChangePromise) {
      return webOrderStatusChangePromise;
    }

    webOrderStatusChangePromise = (async () => {
      const { loadingStatus, webMergeOrderStatus } = (getState() as RootState).order;
      const { persistenceHandles } = extra as ExtraArgument;
      const accessToken = persistenceHandles.webAccessToken.getItem();
      const webOrderNumber = persistenceHandles.webOrderId.getItem() || undefined;
      const webOrderToken = persistenceHandles.webOrderToken.getItem();

      // 若当前正在加载中，跳过本次执行，避免重复请求
      if (loadingStatus) return null;

      const clearGuestOrderPersistence = () => {
        persistenceHandles.webOrderId.removeItem();
        persistenceHandles.webOrderToken.removeItem();
      };

      const tryMergeGuestOrder = async (targetOrderNumber: string) => {
        try {
          return await dispatch(
            mergeOrder.initiate({
              orderNumber: targetOrderNumber,
              orderId: webOrderNumber!,
              orderToken: webOrderToken!,
              skipError: false,
            })
          ).unwrap();
        } catch (error) {
          logger.error('tryMergeGuestOrder failed', { error });
          return null;
        }
      };

      const tryCreateWebOrder = async () => {
        try {
          return await dispatch(createWebOrderForCurrentUser()).unwrap();
        } catch {
          throw new Error(' ~ file: order.helper.ts , create web order failed');
        }
      };

      let orderData = null;

      if (accessToken) {
        // ── 已登录：先尝试拉取用户当前订单 ──────────────────────────────────
        let data = null;
        try {
          data = await dispatch(getWebOrderByCustomer.initiate()).unwrap();
          orderData = data;
        } catch (error) {
          logger.error('getWebOrderByCustomer failed', { error });
        }

        if (webOrderNumber && webOrderToken) {
          // ── 场景：登录时 persistence 中存有游客订单 ──────────────────────
          if (data) {
            // 用户本身已有订单：若与游客订单不同且尚未执行过合并，则触发合并
            if (data.number !== webOrderNumber && !webMergeOrderStatus) {
              const merged = await tryMergeGuestOrder(data.number);
              if (merged) {
                orderData = merged;
                clearGuestOrderPersistence();
              }
            } else {
              clearGuestOrderPersistence();
            }
          } else {
            // 用户无现有订单：先创建新 web 订单，再将游客订单合并进去
            const newOrder = await tryCreateWebOrder();
            if (!webMergeOrderStatus) {
              const merged = await tryMergeGuestOrder(newOrder?.number);
              if (merged) {
                orderData = merged;
                clearGuestOrderPersistence();
              }
            }
          }
        } else {
          // ── 场景：登录时 persistence 中无游客订单 ────────────────────────
          if (data) {
            // 用户已有订单，将其 order id 同步到 persistence
            persistenceHandles.webOrderId.setItem(data.number);
          } else {
            // 用户无订单：清除旧的 persistence 信息，创建新 web 订单
            clearGuestOrderPersistence();
            orderData = await tryCreateWebOrder();
          }
        }
      } else {
        // ── 游客（无 accessToken）────────────────────────────────────────────
        if (webOrderNumber && webOrderToken) {
          // persistence 中存有游客订单，按订单号查询验证是否仍有效
          try {
            const data = await dispatch(
              getWebOrderByOrderNumber.initiate({
                orderNumber: webOrderNumber,
                isNeedSpreeOrderHeader: true,
              })
            ).unwrap();
            orderData = data;
            if (!data) {
              // 订单已不存在，清除 persistence
              clearGuestOrderPersistence();
            }
          } catch {
            // 查询失败，清除 persistence
            clearGuestOrderPersistence();
          }
        }
        // 无 accessToken 且无游客订单时，无需处理
      }

      // 将最终获取到的订单数据同步到 Redux store
      if (orderData) {
        dispatch(setOrder(orderData));
      }

      return orderData;
    })();

    try {
      return await webOrderStatusChangePromise;
    } finally {
      webOrderStatusChangePromise = null;
    }
  }
);
