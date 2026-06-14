import { createSliceWithThunks } from '@castlery/shared-redux-core';
import type { Order } from '@castlery/types';
import {
  AsyncThunk,
  EntityState,
  PayloadAction,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';
import { bindOrderToUser, createWebOrder } from '../api/order.api';
import { CouponItemV1 } from '../entity/coupon.entity';
type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;

export const createAWebOrderByUserId = createAsyncThunk<Order, number>(
  'order/createAWebOrderByUserId',
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      const order = await dispatch(createWebOrder.initiate()).unwrap();
      await dispatch(
        bindOrderToUser.initiate({
          orderNumber: order.number,
          userId,
        })
      ).unwrap();
      return order;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const ORDER_FEATURE_KEY = 'order';
/**
 * cartAdapter
 * @description 通过createEntityAdapter生成的，一组可重用的reducer和selector来管理存储中的规范化数据
 */
export const orderAdapter = createEntityAdapter<Order>({});
export interface OrderState extends EntityState<Order, number> {
  loadingStatus: boolean; //'not loaded' | 'loading' | 'loaded' | 'error';
  webMergeOrderStatus: boolean;
  error?: string | null;
  order: Order | null;
  onlineOrder: Order | null;
  currentOrderNumber: string;
  coupons: CouponItemV1[];
  applyCouponLoading: boolean;
  removeCouponLoading: boolean;
  cartQtyDifference: number;
  transactionOrderDetail: any;
}

export const initialProductState: OrderState = orderAdapter.getInitialState<OrderState>({
  loadingStatus: false,
  webMergeOrderStatus: false,
  error: null,
  order: null,
  onlineOrder: null,
  currentOrderNumber: '',
  ids: [],
  entities: {},
  coupons: [],
  applyCouponLoading: false,
  removeCouponLoading: false,
  cartQtyDifference: 0,
  transactionOrderDetail: null,
});

export const orderSlice = createSliceWithThunks({
  name: ORDER_FEATURE_KEY,
  initialState: initialProductState,
  reducers: (create) => ({
    initShoppingBag: create.asyncThunk(() => {
      return null;
    }),
    setOrder: create.reducer((state, { payload }: PayloadAction<Order>) => {
      state.order = payload;
      state.cartQtyDifference = payload.item_count - state.order.item_count;
    }),
    setOnlineOrder: create.reducer((state, { payload }: PayloadAction<Order | null>) => {
      state.onlineOrder = payload;
    }),
    setCurrentOrderNumber: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.currentOrderNumber = payload;
    }),
    setCoupons: create.reducer((state, { payload }: PayloadAction<CouponItemV1[]>) => {
      state.coupons = payload;
    }),
  }),

  extraReducers(builder) {
    builder
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetOrderApi = action.meta?.arg?.endpointName === 'getOrderByOrderNumber';
          return isGetOrderApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state) => {
          state.loadingStatus = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetOrderApi = action.meta?.arg?.endpointName === 'getOrderByOrderNumber';
          return isGetOrderApi && action.type.endsWith('/pending');
        },
        (state) => {
          state.loadingStatus = true;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetOrderApi = action.meta?.arg?.endpointName === 'getWebOrderByOrderNumber';
          return isGetOrderApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state) => {
          state.loadingStatus = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetOrderApi = action.meta?.arg?.endpointName === 'getWebOrderByOrderNumber';
          return isGetOrderApi && action.type.endsWith('/pending');
        },
        (state) => {
          state.loadingStatus = true;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetOrderApi = action.meta?.arg?.endpointName === 'mergeOrder';
          return isGetOrderApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state) => {
          state.webMergeOrderStatus = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetOrderApi = action.meta?.arg?.endpointName === 'mergeOrder';
          return isGetOrderApi && action.type.endsWith('/pending');
        },
        (state) => {
          state.webMergeOrderStatus = true;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetOrderApi = action.meta?.arg?.endpointName === 'removeWebLineItem';
          return isGetOrderApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state) => {
          state.loadingStatus = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetOrderApi = action.meta?.arg?.endpointName === 'removeWebLineItem';
          return isGetOrderApi && action.type.endsWith('/pending');
        },
        (state) => {
          state.loadingStatus = true;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetOrderApi = action.meta?.arg?.endpointName === 'updateWebOrder';
          return isGetOrderApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state) => {
          state.loadingStatus = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          const isGetOrderApi = action.meta?.arg?.endpointName === 'updateWebOrder';
          return isGetOrderApi && action.type.endsWith('/pending');
        },
        (state) => {
          state.loadingStatus = true;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          return (
            action.meta?.arg?.endpointName === 'applyCouponV1' &&
            (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'))
          );
        },
        (state) => {
          state.applyCouponLoading = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          return action.meta?.arg?.endpointName === 'applyCouponV1' && action.type.endsWith('/pending');
        },
        (state) => {
          state.applyCouponLoading = true;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          return (
            action.meta?.arg?.endpointName === 'removeCouponV1' &&
            (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'))
          );
        },
        (state) => {
          state.removeCouponLoading = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => {
          return action.meta?.arg?.endpointName === 'removeCouponV1' && action.type.endsWith('/pending');
        },
        (state) => {
          state.removeCouponLoading = true;
        }
      )
      .addDefaultCase(() => {});
    // builder.addCase('getOrderByOrderNumber/pending', (state) => {
    //   state.loadingStatus = true;
    // });
    // builder.addCase('getOrderByOrderNumber/rejected', (state) => {
    //   state.loadingStatus = false;
    // });
    // builder.addDefaultCase((state) => {
    //   state.loadingStatus = false;
    // });
  },
  selectors: {
    selectOrder: (state) => state.order,
    selectOrderLineItems: (state) => {
      return state?.order?.line_items;
    },
    selectAddonServiceLineItems: (state) => state.order?.addon_service_line_items,
    selectHasOnlineOrder: (state) => {
      let res = false;
      if (state.onlineOrder) {
        res = state.onlineOrder.line_items.length > 0;
      }
      return res;
    },
    selectOnlineOrder: (state) => state.onlineOrder,
    selectOnlineLineItems: (state) => state.onlineOrder?.line_items,
    selectCurrentOrderNumber: (state) => state.order?.number,
    selectOrderShippingAddress: (state) => state.order?.ship_address,
    selectOrderBillingAddress: (state) => state.order?.bill_address,
    selectOrderShipments: (state) => state.order?.shipments,
    selectCoupons: (state) => state.coupons,
    selectOrderLoading: (state) => state.loadingStatus,
    selectWebMergeOrderLoading: (state) => state.webMergeOrderStatus,
    selectApplyCouponLoading: (state) => state.applyCouponLoading,
    selectRemoveCouponLoading: (state) => state.removeCouponLoading,
    selectCartQtyDifference: (state) => state.cartQtyDifference,
  },
});

/*
 * Export reducer for store configuration.
 */
export const orderReducer = orderSlice.reducer;
export const { initShoppingBag, setOrder, setOnlineOrder, setCurrentOrderNumber, setCoupons } = orderSlice.actions;

export const {
  selectOrder,
  selectHasOnlineOrder,
  selectCurrentOrderNumber,
  selectOnlineOrder,
  selectAddonServiceLineItems,
  selectOrderLineItems,
  selectOrderBillingAddress,
  selectOrderShippingAddress,
  selectOrderShipments,
  selectOnlineLineItems,
  selectCoupons,
  selectOrderLoading,
  selectWebMergeOrderLoading,
  selectApplyCouponLoading,
  selectRemoveCouponLoading,
  selectCartQtyDifference,
} = orderSlice.selectors;
export const selectCartItems = createSelector(
  [orderSlice.selectors.selectOrderLineItems, orderSlice.selectors.selectAddonServiceLineItems],
  (lineItems, serviceLineItems) => [...(lineItems || []), ...(serviceLineItems || [])]
);

export const selectCouponProcessing = createSelector(
  [selectApplyCouponLoading, selectRemoveCouponLoading],
  (applyCouponLoading, removeCouponLoading) => applyCouponLoading || removeCouponLoading
);
