import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  refreshCartToken,
  getCartItemsCount,
  addLineItemToCart,
  updateCartItemQty,
  removeCartItem,
  initCheckout,
  selectCartLineItems,
  mergeCart,
  transferCartItems,
  addGiftToCart,
  updateGiftInCart,
  getCartData,
  selectLineItemsAndServiceLineItems,
  type AddGiftToCartRequestPayload,
  type UpdateGiftInCartRequestPayload,
  type PosAtcServiceRequestPayload,
  type PosAtcRequestPayload,
  type WebAtcRequestPayload,
  type BatchAtcResponseData,
  type CartWarrantyPayload,
  AtcFulfillmentMethod,
  AtcFulfillmentWarehouseTypeEnum,
  CartItemState,
  updateZipcodeInCart,
  batchAddLineItemToCart,
  selectCartGiftItems,
  addedCartActionSucceededEvent,
  updatedCartQtyActionSucceededEvent,
  removedCartActionSucceededEvent,
  addedSwatchActionSucceededEvent,
  addedGiftActionSucceededEvent,
  type AtcScene,
  type AtcType,
  setGuardsmanCartItems,
  clearGuardsmanCartItems,
} from '@castlery/modules-cart-domain';
import { selectedActiveUser, selectedCurrentCustomer, noticeCityInfoUpdated } from '@castlery/modules-user-domain';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import {
  OnlineAddCartSource,
  ProductTypeMapping,
  OfflineAddCartSource,
  enableO2O,
  X_CART_TOKEN,
  X_ACCESS_TOKEN,
  accessInPos,
  accessInWeb,
  MarketCurrency,
  enableZipCode,
  fetchGuardsmanCartPlans,
} from '@castlery/config';
import { RootState } from '@castlery/shared-redux-store';
import { LineItem_V2, LineItemSchema, Variant, GiftLineItemSchema, AddOnServiceLineItemSchema } from '@castlery/types';
import {
  selectProduct,
  selectVariant,
  selectVariantQuantity,
  selectCurrentBundleVariants,
  selectCurrentProductStockState,
  selectSelectedWarrantyOfferId,
  selectCurrentWarrantyOffer,
} from '@castlery/modules-product-domain';
import { STOCK_STATE } from '@castlery/utils';
import { getWarrantyProvider } from '@castlery/monorepo-features';

/**
 * 刷新未登录用户的购物车token
 * 用于购物车相关所有接口调用,Header `X-CartToken` 传递token
 */
export const refreshCartTokenInClientCommand = createAsyncThunk(
  'cart/refreshCartTokenInClientCommand',
  async (_, { dispatch, rejectWithValue, extra }) => {
    const { persistenceHandles } = extra as ExtraArgument;
    const accessToken = persistenceHandles.webAccessToken.getItem();
    // 如果在服务端调用，取cookie的方式需要调整
    // 如果accessToken存在，则不请求新的token
    const xCartTokenInCookie = persistenceHandles.xCartToken.getItem();
    if (accessToken || xCartTokenInCookie) {
      return { token: xCartTokenInCookie };
    }

    // 如果没有传入token，则请求新的token，并刷新token，并返回token
    const res = await dispatch(refreshCartToken.initiate());

    if (res.error) {
      return rejectWithValue(res.error);
    }
    const token = res.data?.token;
    if (typeof token === 'string' && token) {
      const { persistenceHandles } = extra as ExtraArgument;
      persistenceHandles.xCartToken.setItem(token);
    }
    return res.data;
  }
);

/**
 * @description: Get Cart Info In Server
 */
export const getCartDataInServerCommand = createAsyncThunk(
  'cart/getCartDataInServerCommand',
  async (
    { xCartToken, accessToken }: { xCartToken: string | undefined; accessToken: string | undefined },
    { dispatch, rejectWithValue }
  ) => {
    // step1: 检查cart token， access token or x cart token, 二选一必须存在
    const headers = new Headers();
    if (accessToken) {
      headers.set(X_ACCESS_TOKEN, accessToken);
    } else if (xCartToken) {
      headers.set(X_CART_TOKEN, xCartToken);
    }
    // 检查cart token 或 access token 是否存在
    if (!headers.get(X_CART_TOKEN) && !headers.get(X_ACCESS_TOKEN)) {
      // 如果cart token 或 access token 不存在，则返回错误, 不在服务端获取cart Token， 而是进入客户端 refetch token和cart的逻辑
      return rejectWithValue('getCartDataInServerCommand Error: x_cart_token or access_token is not found');
    }
    // step2: 获取cart data
    const res = await dispatch(getCartData.initiate(headers));
    if (res.error) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

export const getCartDataInClientCommand = createAsyncThunk(
  'cart/getCartDataInClientCommand',
  async (_, { dispatch, extra, rejectWithValue }) => {
    const { persistenceHandles } = extra as ExtraArgument;
    const xCartToken = persistenceHandles.xCartToken.getItem();
    const accessToken = persistenceHandles.webAccessToken.getItem();
    if (!xCartToken && !accessToken) {
      const res = await dispatch(refreshCartTokenInClientCommand());
      if ('error' in res && res.error) {
        return rejectWithValue(res.error);
      }
    }
    const cartRes = await dispatch(getCartData.initiate());
    if (cartRes.error) {
      return rejectWithValue(cartRes.error);
    }
    return cartRes.data;
  }
);

export const loadGuardsmanCartPlansCommand = createAsyncThunk(
  'cart/loadGuardsmanCartPlansCommand',
  async (_, { dispatch, getState, rejectWithValue }) => {
    // [保险接入] Cart/MiniCart 侧 Guardsman plan 预加载（仅 CA）
    // - 过滤可投保 line item（排除 service/swatch/disabled）
    // - fetchGuardsmanCartPlans → 写入 cart slice guardsmanCartItems
    // - 供 WarrantyInlineButton 判断 hasGuardsmanPlans 并打开 widget
    if (getWarrantyProvider() !== 'guardsman') {
      dispatch(clearGuardsmanCartItems());
      return {};
    }

    const rootState = getState() as RootState;
    const cartItems = accessInPos
      ? selectLineItemsAndServiceLineItems(rootState as RootState & { cart: CartItemState })
      : selectCartLineItems(rootState as RootState & { cart: CartItemState });
    const warrantyEligibleLines =
      cartItems?.filter(
        (item: LineItemSchema | AddOnServiceLineItemSchema) =>
          item.status !== 'disabled' &&
          ![ProductTypeMapping.SERVICE, ProductTypeMapping.SWATCH].includes(item.productType as ProductTypeMapping) &&
          Boolean(item.variant?.sku)
      ) || [];

    if (!warrantyEligibleLines.length) {
      dispatch(clearGuardsmanCartItems());
      return {};
    }

    try {
      const cartLines = warrantyEligibleLines.map((item) => ({
        lineId: item.id,
        // productId: 'furniture-sofa-001',  //test sku
        productId: item.variant?.sku || '',
        price: Number(item.salePrice || item.variant?.price || item.cartSalePrice || 0),
      }));
      const result = await fetchGuardsmanCartPlans(cartLines);

      if (!result?.success || !Array.isArray(result.items)) {
        dispatch(clearGuardsmanCartItems());
        return {};
      }

      const cartLinesMap = cartLines.reduce<Record<string, (typeof cartLines)[number]>>((acc, item) => {
        acc[item.lineId] = item;
        return acc;
      }, {});
      const guardsmanCartItems = result.items.reduce<Record<string, (typeof result.items)[number]>>((acc, item) => {
        const requestContext = cartLinesMap[item.lineId];
        acc[item.lineId] = {
          ...item,
          requestedProductId: requestContext?.productId,
          requestedPrice: requestContext?.price,
        };
        return acc;
      }, {});

      dispatch(setGuardsmanCartItems(guardsmanCartItems));
      return guardsmanCartItems;
    } catch (error) {
      dispatch(clearGuardsmanCartItems());
      return rejectWithValue(error);
    }
  }
);

export const refreshCartCountCommand = createAsyncThunk(
  'cart/refreshCartCountCommand',
  async (_, { dispatch, rejectWithValue }) => {
    console.log('refreshCartCountCommand');
    const res = await dispatch(getCartItemsCount.initiate(undefined, { forceRefetch: true }));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

// ─── addToCartCommandV2 types & resolvers ────────────────────────────────────

type AtcWebBase = {
  source: OnlineAddCartSource;
  /**
   * Caller-declared ATC type for analytics (e.g. PDP regular click vs 1-click vs AI casa).
   * Defaults to 'regular'. Carried into `addedCartActionSucceededEvent.payload.atcType`.
   */
  atcType?: AtcType;
};
type AtcPosBase = {
  source: OfflineAddCartSource;
  /** fulfillment method, defaults to Delivery */
  fulfillmentMethod?: number;
  /** fulfillment warehouse type, defaults to Warehouse */
  fulfillmentWarehouseType?: number;
};
type AtcListBase = { variant: Partial<Variant>; quantity?: number; isLowStock?: boolean };

/**
 * Discriminated union — add a new member here for each new ATC scene.
 *
 * pdp-web  : PDP on web, variant/bundle/warranty resolved from Redux store
 * pdp-pos  : PDP on POS, same store resolution + fulfillment fields
 * swatch   : free swatch, fixed qty=1, price=$0
 * rec-list : recommendation carousel ATC, variant passed via payload
 * cart-list: cart cross-sell / cart list ATC, variant passed via payload
 */
export type AddToCartPayloadV2 =
  | (AtcWebBase & { scene: 'pdp-web' })
  | (AtcPosBase & { scene: 'pdp-pos' })
  | (AtcWebBase & { scene: 'swatch'; variant: Partial<Variant> })
  | (AtcPosBase & { scene: 'swatch'; variant: Partial<Variant> })
  | (AtcWebBase & AtcListBase & { scene: 'rec-list' })
  | (AtcWebBase & AtcListBase & { scene: 'cart-list' });

type ResolvedAtcLineItem = {
  variantId: number;
  quantity: number;
  salePrice: string;
  productType?: string;
  isLowStock: boolean;
  warranty?: CartWarrantyPayload;
  warrantyId?: string;
  bundleLineItems?: Array<{ variantId: number; quantity: number; optionId?: number }>;
};

type CartTrackingContext = {
  lineItem: LineItemSchema;
  cartLineItems: LineItemSchema[];
  cartItemTotal: string;
  customer: {
    userStatus: 'logged-in' | 'logged-out';
    userEmail: string;
    userEmail2: string;
  };
};

type RefreshedCartSnapshot = {
  giftItems: GiftLineItemSchema[];
  lineItems: LineItemSchema[];
  itemTotal: string;
};

async function refreshCartSnapshot(dispatch: any): Promise<RefreshedCartSnapshot> {
  const result = (await dispatch(getCartData.initiate(undefined, { forceRefetch: true }))) as {
    data?: {
      gifts?: GiftLineItemSchema[];
      lineItems?: LineItemSchema[];
      summary?: { itemTotal?: { actualSubtotal?: string } };
    };
  };

  return {
    giftItems: result.data?.gifts ?? [],
    lineItems: result.data?.lineItems ?? [],
    itemTotal: result.data?.summary?.itemTotal?.actualSubtotal ?? '',
  };
}

function buildCartTrackingContext(
  snapshot: RefreshedCartSnapshot,
  variantId: number,
  rootState: RootState,
  fallbackLineItem?: LineItemSchema | GiftLineItemSchema,
  options?: { includeGifts?: boolean }
): CartTrackingContext | null {
  const searchableLineItems = options?.includeGifts
    ? [...snapshot.lineItems, ...snapshot.giftItems]
    : snapshot.lineItems;
  const lineItem = searchableLineItems.find((item) => item.variant.id === variantId) ?? fallbackLineItem;

  if (!lineItem || lineItem.productType === ProductTypeMapping.SWATCH) {
    return null;
  }

  const customer = accessInWeb ? selectedActiveUser(rootState) : selectedCurrentCustomer(rootState);

  return {
    lineItem: lineItem as LineItemSchema,
    cartLineItems: snapshot.lineItems,
    cartItemTotal: snapshot.itemTotal,
    customer: {
      userStatus: customer ? 'logged-in' : 'logged-out',
      userEmail: customer?.emailHashed || '',
      userEmail2: customer?.email || '',
    },
  };
}

/**
 * [保险接入] 将 PDP 选中的 offerId 映射为 Cart V2 加车字段
 * - Guardsman (CA): { warranty: { vendor, offerId } }
 * - Mulberry (US Cart V2 路径): { warrantyId: offerId }
 * - 空 offerId 时不附带保险字段
 */
function buildCartWarrantyFields(offerId: string): Pick<ResolvedAtcLineItem, 'warranty' | 'warrantyId'> {
  if (!offerId) {
    return {};
  }

  const provider = getWarrantyProvider();
  if (provider === 'guardsman') {
    return {
      warranty: {
        vendor: provider,
        offerId,
      },
    };
  }

  if (provider === 'mulberry') {
    return {
      warrantyId: offerId,
    };
  }

  return {};
}

function resolveSwatchLineItem(variant: Partial<Variant>): ResolvedAtcLineItem {
  return {
    variantId: variant.id as number,
    quantity: 1,
    salePrice: '0',
    productType: ProductTypeMapping.SWATCH,
    isLowStock: false,
  };
}

/** Shared resolver for rec-list and cart-list — variant comes from payload */
function resolveExternalVariantLineItem(
  payload: Extract<AddToCartPayloadV2, { scene: 'rec-list' | 'cart-list' }>
): ResolvedAtcLineItem {
  return {
    variantId: (payload.variant as any).id,
    quantity: payload.quantity ?? 1,
    salePrice: payload.variant?.price ?? '',
    isLowStock: payload.isLowStock ?? false,
  };
}

/**
 * [保险接入] PDP 加车 line item 解析（scene: pdp-web / pdp-pos）
 * - 从 warranty slice 读取选中 plan，经 buildCartWarrantyFields 写入 Cart V2 payload
 * - CA: selectedGuardsmanPlanId → warranty.vendor + offerId
 * - US Cart V2 若启用: selectCurrentWarrantyOffer.warranty_offer_id → warrantyId
 */
/** Shared resolver for pdp-web and pdp-pos — variant/bundle/warranty from Redux store */
function resolvePdpLineItem(rootState: RootState, isPosMode: boolean): ResolvedAtcLineItem | null {
  const currentCartLineItems = selectCartLineItems(rootState as RootState & { cart: CartItemState });
  const productInStore = selectProduct(rootState);
  const variantInStore = selectVariant(rootState);

  if (!variantInStore) return null;

  // POS: user manually picks quantity each time, even if item is already in cart
  // Web: if already in cart, increment by qty_increments; otherwise use user-selected quantity
  const quantity = isPosMode
    ? selectVariantQuantity(rootState) || 1
    : (() => {
        const hasBeenInCart = currentCartLineItems.some(
          (item: LineItemSchema) => item.variant.id === variantInStore.id
        );
        return hasBeenInCart ? productInStore?.qty_increments ?? 1 : selectVariantQuantity(rootState) || 1;
      })();

  const bundleVariants = selectCurrentBundleVariants(rootState);
  // [保险接入] 从 warranty slice 读取 PDP 选中的 plan（Guardsman/Mulberry 字段不同）
  const currentWarrantyOffer =
    getWarrantyProvider() === 'guardsman'
      ? selectSelectedWarrantyOfferId(rootState)
      : selectCurrentWarrantyOffer(rootState)?.warranty_offer_id ?? '';
  const productStockState = selectCurrentProductStockState(rootState);

  const bundleLineItems = bundleVariants
    ? Object.values(bundleVariants).map((option) => ({
        variantId: option.optionVariantId,
        quantity: option.quantity,
        optionId: option.optionId ? Number(option.optionId) : undefined,
      }))
    : [];

  return {
    variantId: (variantInStore as any).id,
    quantity,
    salePrice: (variantInStore as any).price ?? '',
    productType: productInStore?.product_type ?? '',
    isLowStock: productStockState === STOCK_STATE.LOW_IN_STOCK,
    ...buildCartWarrantyFields(currentWarrantyOffer ?? ''),
    ...(bundleLineItems.length > 0 ? { bundleLineItems } : {}),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @description  Add items to cart - for Order Refactoring
 */
export const addToCartCommandV2 = createAsyncThunk(
  'cart/addToCartCommandV2',
  async (payload: AddToCartPayloadV2, { getState, dispatch, rejectWithValue }) => {
    try {
      const rootState = getState() as RootState;

      let resolved: ResolvedAtcLineItem | null;
      switch (payload.scene) {
        case 'pdp-web':
          resolved = resolvePdpLineItem(rootState, false);
          break;
        case 'pdp-pos':
          resolved = resolvePdpLineItem(rootState, true);
          break;
        case 'swatch':
          resolved = resolveSwatchLineItem(payload.variant);
          break;
        case 'rec-list':
        case 'cart-list':
          resolved = resolveExternalVariantLineItem(payload);
          break;
      }

      if (!resolved) {
        return rejectWithValue('Error in addToCartCommandV2: variant is not found');
      }

      const lineItems = [{ ...resolved, currency: MarketCurrency }];

      // pdp-pos carries fulfillment fields explicitly; other scenes in POS context use defaults
      // if customer selected warehouse, the fulfillmentMethod will be only delivery
      // if customer selected showroom, the fulfillmentMethod will be cash and carry and delivery
      let parameters: PosAtcRequestPayload | WebAtcRequestPayload;
      if (payload.scene === 'pdp-pos') {
        parameters = {
          lineItems,
          source: payload.source,
          fulfillmentMethod: payload.fulfillmentMethod ?? AtcFulfillmentMethod.Delivery,
          fulfillmentWarehouseType: payload.fulfillmentWarehouseType ?? AtcFulfillmentWarehouseTypeEnum.Warehouse,
        } as PosAtcRequestPayload;
      } else if (accessInPos) {
        parameters = {
          lineItems,
          source: payload.source,
          fulfillmentMethod: AtcFulfillmentMethod.Delivery,
          fulfillmentWarehouseType: AtcFulfillmentWarehouseTypeEnum.Warehouse,
        } as PosAtcRequestPayload;
      } else {
        parameters = { lineItems, source: payload.source } as WebAtcRequestPayload;
      }

      const res = await dispatch(addLineItemToCart.initiate(parameters));
      if (res.error) {
        return rejectWithValue(res.error);
      }

      try {
        if (payload.scene === 'swatch') {
          const swatchVariant = (payload as Extract<AddToCartPayloadV2, { scene: 'swatch' }>).variant;
          const product = selectProduct(rootState);
          const currentPathname = window.location.pathname;
          const isProductPageSwatch =
            currentPathname.includes('/products/') && product && currentPathname.includes(product.slug);
          dispatch(
            addedSwatchActionSucceededEvent({
              sku: swatchVariant.sku ?? '',
              skuName: swatchVariant.name ?? '',
              relatedProductId: isProductPageSwatch ? product.id : undefined,
              relatedProductSlug: isProductPageSwatch ? product.slug : undefined,
            })
          );
        } else {
          const variantId = lineItems[0]?.variantId;
          if (typeof variantId === 'number') {
            const snapshot = await refreshCartSnapshot(dispatch);
            const tracking = buildCartTrackingContext(snapshot, variantId, rootState);
            const isWebScene = !accessInPos;
            const atcType: AtcType = isWebScene ? (payload as AtcWebBase).atcType ?? 'regular' : 'regular';

            if (tracking) {
              dispatch(
                addedCartActionSucceededEvent({
                  variantId,
                  quantityDifference: lineItems[0].quantity,
                  atcType,
                  scene: payload.scene as AtcScene,
                  source: String(payload.source),
                  tracking,
                })
              );
            }
          }
        }
      } catch {
        // Tracking is best-effort — never block the ATC success path on a failed dispatch
      }

      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateCartQtyCommand = createAsyncThunk(
  'cart/updateCartQtyCommand',
  async (
    payload: {
      lineItem: LineItemSchema;
      quantity: number;
    },
    { dispatch, getState, rejectWithValue }
  ) => {
    const { lineItem, quantity } = payload;
    const prevQuantity = lineItem.quantity;
    const res = await dispatch(
      updateCartItemQty.initiate({ lineItemId: lineItem.id, variantId: lineItem.variant.id, quantity })
    );

    if (res.error) {
      return rejectWithValue(res.error);
    }

    try {
      const snapshot = await refreshCartSnapshot(dispatch);
      // ========================= tracking events ===========================
      // tracking updated cart item only for web
      if (accessInWeb) {
        const rootState = getState() as RootState;
        const quantityDifference = quantity - prevQuantity;
        const tracking = buildCartTrackingContext(snapshot, lineItem.variant.id, rootState, lineItem);
        if (tracking) {
          dispatch(
            updatedCartQtyActionSucceededEvent({
              variantId: lineItem.variant.id,
              lineItemId: lineItem.id,
              tracking: {
                ...tracking,
                quantityDifference,
              },
            })
          );
        }
      }
    } catch {
      // best-effort
    }

    return res.data;
  }
);

export const removeCartItemCommand = createAsyncThunk(
  'cart/removeCartItemCommand',
  async (payload: { lineItem: LineItemSchema }, { dispatch, getState, rejectWithValue }) => {
    const { lineItem } = payload;
    const res = await dispatch(removeCartItem.initiate({ lineItemId: lineItem.id }));

    if (res.error) {
      return rejectWithValue(res.error);
    }

    try {
      // 更新购物车
      const snapshot = await refreshCartSnapshot(dispatch);
      // ========================= tracking events ===========================
      // tracking removed cart item only for web
      if (accessInWeb) {
        const rootState = getState() as RootState;
        const customer = selectedActiveUser(rootState);
        dispatch(
          removedCartActionSucceededEvent({
            lineItem,
            tracking: {
              lineItem,
              quantityDifference: lineItem.quantity,
              cartLineItems: snapshot.lineItems,
              cartItemTotal: snapshot.itemTotal,
              customer: {
                userStatus: customer ? 'logged-in' : 'logged-out',
                userEmail: customer?.emailHashed || '',
                userEmail2: customer?.email || '',
              },
            },
          })
        );
      }
    } catch {
      // best-effort
    }

    return res.data;
  }
);

export const addGiftToCartCommand = createAsyncThunk(
  'cart/addGiftToCartCommand',
  async (
    payload: {
      giftPoolId: AddGiftToCartRequestPayload['giftPoolId'];
      quantity: AddGiftToCartRequestPayload['quantity'];
      variantId: AddGiftToCartRequestPayload['variantId'];
      salePrice: AddGiftToCartRequestPayload['salePrice'];
      warrantyId?: AddGiftToCartRequestPayload['warrantyId'];
      coupon?: AddGiftToCartRequestPayload['coupon'];
      fulfillmentMethod?: number;
      fulfillmentWarehouse?: number;
      trackingLabel?: 'miniCart' | 'fullCart';
    },
    { dispatch, getState, rejectWithValue }
  ) => {
    const { trackingLabel = 'fullCart', ...requestPayload } = payload;
    const _payload = accessInPos
      ? ({
          ...requestPayload,
          source: OfflineAddCartSource.PosCartGift,
          currency: MarketCurrency,
          fulfillmentMethod: requestPayload.fulfillmentMethod ?? AtcFulfillmentMethod.Delivery,
          fulfillmentWarehouse: requestPayload.fulfillmentWarehouse ?? AtcFulfillmentWarehouseTypeEnum.Warehouse,
        } as AddGiftToCartRequestPayload)
      : ({
          ...requestPayload,
          source: OnlineAddCartSource.WebCartGift,
          currency: MarketCurrency,
        } as AddGiftToCartRequestPayload);
    const res = await dispatch(addGiftToCart.initiate(_payload));
    if (res.error) {
      return rejectWithValue(res.error);
    }

    try {
      const rootState = (getState as () => RootState)();
      const snapshot = await refreshCartSnapshot(dispatch);
      const tracking = buildCartTrackingContext(snapshot, _payload.variantId, rootState, undefined, {
        includeGifts: true,
      });

      if (tracking) {
        dispatch(
          addedGiftActionSucceededEvent({
            variantId: _payload.variantId,
            giftId: tracking.lineItem.variant?.sku || String(_payload.variantId),
            campaignName: 'cart_event',
            label: trackingLabel,
            source: String(_payload.source),
            tracking: {
              ...tracking,
              quantityDifference: _payload.quantity,
            },
          })
        );
      }
    } catch {
      // best-effort
    }

    return res.data;
  }
);

export const updateGiftInCartCommand = createAsyncThunk(
  'cart/updateGiftInCartCommand',
  async (
    payload: {
      lineItemId: UpdateGiftInCartRequestPayload['lineItemId'];
      giftPoolId: UpdateGiftInCartRequestPayload['giftPoolId'];
      variantId: UpdateGiftInCartRequestPayload['variantId'];
      quantity: UpdateGiftInCartRequestPayload['quantity'];
      salePrice: UpdateGiftInCartRequestPayload['salePrice'];
      coupon?: string;
      fulfillmentMethod?: number;
      fulfillmentWarehouse?: number;
    },
    { dispatch, rejectWithValue }
  ) => {
    const _payload = accessInPos
      ? ({
          ...payload,
          source: OfflineAddCartSource.PosCartGift,
          currency: MarketCurrency,
          fulfillmentMethod: payload.fulfillmentMethod ?? AtcFulfillmentMethod.Delivery,
          fulfillmentWarehouse: payload.fulfillmentWarehouse ?? AtcFulfillmentWarehouseTypeEnum.Warehouse,
        } as UpdateGiftInCartRequestPayload)
      : ({
          ...payload,
          source: OnlineAddCartSource.WebCartGift,
          currency: MarketCurrency,
        } as UpdateGiftInCartRequestPayload);
    const res = await dispatch(updateGiftInCart.initiate(_payload));
    if (res.error) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

/**
 * @description: 初始化 checkout
 * @note: 2025/08/28 @abby
 * @returns
 */
export const initCheckoutCommand = createAsyncThunk(
  'cart/initCheckoutCommand',
  async (_, { dispatch, getState, rejectWithValue, extra }) => {
    const rootState = getState() as RootState;
    const lineItems = accessInPos ? selectLineItemsAndServiceLineItems(rootState) : selectCartLineItems(rootState);
    const gifts = selectCartGiftItems(rootState);
    if (!lineItems?.length) {
      return rejectWithValue('Error in initCheckoutCommand: cart items is empty');
    }

    const lineItemIds = lineItems.map((item: LineItemSchema | AddOnServiceLineItemSchema) => item.id);
    const giftItemIds = gifts.map((item: GiftLineItemSchema) => item.id);
    const res = await dispatch(initCheckout.initiate({ lineItemIds: [...lineItemIds, ...giftItemIds] }));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    // 执行checkout session存储
    const token = res.data?.token;
    if (typeof token === 'string' && token) {
      const { persistenceHandles } = extra as ExtraArgument;
      // 存储checkout session token 到web
      if (accessInWeb) {
        persistenceHandles.xCheckoutSessionToken.setItem(token);
      }

      // 存储checkout session token 到pos, 在结算之后需要清除
      if (accessInPos) {
        const customerId = selectedCurrentCustomer(rootState)?.id;
        if (customerId) {
          persistenceHandles.xCheckoutSessionToken.setItem(
            JSON.stringify({
              token,
              customerId,
            })
          );
        }
      }
    }

    return res.data;
  }
);

export const mergeCartCommand = createAsyncThunk(
  'cart/mergeCartCommand',
  async (_, { dispatch, rejectWithValue, extra, fulfillWithValue }) => {
    const { persistenceHandles } = extra as ExtraArgument;
    let shouldMerge = false;

    if (accessInWeb) {
      const webAccessToken = persistenceHandles.webAccessToken.getItem();
      const cartToken = persistenceHandles.xCartToken.getItem();
      shouldMerge = !!webAccessToken && !!cartToken;
    } else if (accessInPos) {
      const customerId = persistenceHandles.customerId.getItem();
      const cartToken = persistenceHandles.xPosCartToken.getItem();
      shouldMerge = !!customerId && !!cartToken;
    }

    if (shouldMerge) {
      const res = await dispatch(mergeCart.initiate());
      // 无论是否merge成功，都要清除 cart token
      // https://castlery.atlassian.net/wiki/spaces/PM/pages/3017113691/Cart+Item+List#5%E3%80%81%E8%B4%AD%E7%89%A9%E8%BD%A6%E5%95%86%E5%93%81%E7%9A%84%E7%A7%BB%E5%87%BA%2F%E6%81%A2%E5%A4%8D%2F%E5%90%88%E5%B9%B6%E5%9C%BA%E6%99%AF
      if (accessInWeb) {
        persistenceHandles.xCartToken.removeItem();
      } else if (accessInPos) {
        persistenceHandles.xPosCartToken.removeItem();
      }
      if ('error' in res) {
        return rejectWithValue(res.error);
      }
      return res.data;
    }
    return fulfillWithValue(null);
  }
);

/**
 * Only for Pos
 * add service item to pos cart
 */
export const addServiceItemToPosCartCommand = createAsyncThunk(
  'cart/addServiceItemToPosCartCommand',
  async (payload: { variantId: number; salePrice: string }[], { dispatch, rejectWithValue }) => {
    if (!payload || payload.length === 0)
      return rejectWithValue('[addServiceItemToPosCartCommand Error]:payload is empty');
    const serviceItems = payload.map((item) => {
      return {
        ...item,
        quantity: 1,
        currency: MarketCurrency,
        productType: ProductTypeMapping.SERVICE,
      };
    });
    const res = await dispatch(
      addLineItemToCart.initiate({
        lineItems: serviceItems,
        source: OfflineAddCartSource.POS,
      } as PosAtcServiceRequestPayload)
    );
    if (res.error) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

/**
 * Only for Pos
 * fetch web cart items
 * todo
 */
export const getWebCartItemsInPosCommand = createAsyncThunk(
  'cart/getWebCartItemsInPosCommand',
  async (_, { dispatch, getState, rejectWithValue }) => {
    const rootState = getState() as RootState;
    if (!enableO2O) {
      return rejectWithValue('[getWebCartItemsInPosCommand Error]:enableO2O is false');
    }
    const customer = selectedCurrentCustomer(rootState);
    if (!customer) {
      return rejectWithValue('[getWebCartItemsInPosCommand Error]:customer not found');
    }
    const res = await dispatch(getCartData.initiate(undefined, { forceRefetch: true }));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

/**
 * Only for Pos
 * transfer pos cart items to web
 */
export const transferCartItemsCommand = createAsyncThunk(
  'cart/transferCartItemsCommand',
  async (payload: { pushDestination: 'pos' | 'web' }, { dispatch, getState, rejectWithValue }) => {
    if (!payload.pushDestination) {
      return rejectWithValue('[transferCartItemsCommand Error]:pushDestination is empty');
    }
    const rootState = getState() as RootState;
    const posCartLineItems = selectCartLineItems(rootState);

    if (posCartLineItems.length === 0) {
      return rejectWithValue('[transferCartItemsCommand Error]:posCartLineItems is empty');
    }
    const lineItemIdList = posCartLineItems.map((item: any) => ({
      lineItemId: item.id,
      variantId: item.variant.id,
    }));
    const requestPayload = {
      lineItemIdList: lineItemIdList,
      pushDestination: payload.pushDestination,
    };
    const res = await dispatch(transferCartItems.initiate(requestPayload));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

/**
 * Only for Pos
 * transfer online cart items to pos
 */
export const transferOnlineCartItemsToPosCommand = createAsyncThunk(
  'cart/transferOnlineCartItemsToPosCommand',
  async (
    payload: { lineItemId: LineItem_V2['id']; variantId: LineItem_V2['variant']['id'] }[],
    { dispatch, rejectWithValue }
  ) => {
    if (!payload || payload.length === 0) {
      return rejectWithValue('[transferOnlineCartItemsToPosCommand Error]:payload is empty');
    }
    const requestPayload = {
      lineItemIdList: payload,
      pushDestination: 'pos' as const,
    };
    const res = await dispatch(transferCartItems.initiate(requestPayload));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

/**
 * 批量加车请求参数
 */
export interface BatchAddToCartPayload {
  source: string;
  lineItems: Array<{
    variantId: number;
    quantity: number;
    salePrice: string;
    currency: string;
    productType: string;
    warrantyId?: string;
    isLowStock?: boolean;
    giftPoolId?: string;
    /** SKU Name，用于失败时展示 */
    variantName?: string;
    bundleLineItems?: Array<{
      variantId: number;
      quantity: number;
      optionId?: number;
    }>;
    fulfillmentMethod?: number;
    fulfillmentWarehouse?: number;
  }>;
}

/**
 * @description Batch add items to cart - supports adding multiple line items at once
 * @param payload - Line items to add and source
 * @returns BatchAtcResponseData containing createLineResults (success) and failResults (failure)
 */
/**
 * 批量加车错误响应结构
 */
export interface BatchAtcErrorResponse {
  code: number;
  msg: string;
  data: BatchAtcResponseData | null;
}

export const batchAddToCartCommand = createAsyncThunk<
  BatchAtcResponseData | null,
  BatchAddToCartPayload,
  { rejectValue: BatchAtcErrorResponse }
>('cart/batchAddToCartCommand', async (payload, { dispatch, getState, rejectWithValue }) => {
  if (!payload.lineItems || payload.lineItems.length === 0) {
    return rejectWithValue({
      code: -1,
      msg: 'lineItems is empty',
      data: null,
    });
  }

  // Build request payload based on access context
  const requestPayload = accessInPos
    ? ({
        lineItems: payload.lineItems,
        source: payload.source,
      } as PosAtcRequestPayload)
    : ({
        lineItems: payload.lineItems,
        source: payload.source,
      } as WebAtcRequestPayload);

  // Call API
  const res = await dispatch(batchAddLineItemToCart.initiate(requestPayload));

  if (!res.error) {
    try {
      const rootState = getState() as RootState;
      const snapshot = await refreshCartSnapshot(dispatch);
      const responseData = res.data as BatchAtcResponseData | null | undefined;
      const failedVariantIds = new Set((responseData?.failResults ?? []).map((f) => f.variantId));
      for (const requested of payload.lineItems) {
        if (failedVariantIds.has(requested.variantId)) continue;

        const tracking = buildCartTrackingContext(snapshot, requested.variantId, rootState);
        if (!tracking) continue;

        dispatch(
          addedCartActionSucceededEvent({
            variantId: requested.variantId,
            quantityDifference: requested.quantity,
            atcType: 'regular',
            scene: 'batch',
            source: String(payload.source),
            tracking,
          })
        );
      }
    } catch {
      // best-effort
    }
  }

  if (res.error) {
    // 解析错误信息：error.message 包含 JSON 格式的响应数据
    try {
      const errorMessage = (res.error as { message?: string })?.message || '';
      const parsedError = JSON.parse(errorMessage) as BatchAtcErrorResponse;
      return rejectWithValue(parsedError);
    } catch {
      // 如果解析失败，返回通用错误
      return rejectWithValue({
        code: -1,
        msg: 'Unknown error',
        data: null,
      });
    }
  }

  return res.data as BatchAtcResponseData | null;
});

export const clearPosCartCommand = createAsyncThunk(
  'cart/clearPosCartCommand',
  async (_, { dispatch, rejectWithValue, extra }) => {
    const { persistenceHandles } = extra as ExtraArgument;
    persistenceHandles.xPosCartToken.removeItem();
    persistenceHandles.xCheckoutSessionToken.removeItem();
    persistenceHandles.customerId.removeItem();
    persistenceHandles.temporaryCustomerEmail.removeItem();

    const res = await dispatch(refreshCartToken.initiate(undefined, { forceRefetch: true }));
    let refreshedCartToken = '';
    if (res.data?.token && typeof res.data.token === 'string') {
      refreshedCartToken = res.data.token;
      persistenceHandles.xPosCartToken.setItem(refreshedCartToken);
    }
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    const cartRes = await dispatch(
      getCartData.initiate(refreshedCartToken ? { [X_CART_TOKEN]: refreshedCartToken } : undefined, {
        forceRefetch: true,
      })
    );
    if ('error' in cartRes) {
      return rejectWithValue(cartRes.error);
    }
    return;
  }
);

export const syncPosZipcodeCommand = createAsyncThunk(
  'cart/syncPosZipcodeCommand',
  async ({ cartZipcode, hasCustomer }: { cartZipcode: any; hasCustomer: boolean }, { dispatch, extra }) => {
    const { persistenceHandles } = extra as ExtraArgument;
    if (enableZipCode && cartZipcode) {
      //如果已经存在customer ID，此时，以 customer cart zipcode 更新到全局
      if (hasCustomer) {
        const payload = {
          zipcode: cartZipcode.zipcode,
          state: cartZipcode.countryState,
          city: cartZipcode.city,
        };
        dispatch(noticeCityInfoUpdated(payload));
        persistenceHandles.city.setItem(JSON.stringify(payload));
      } else {
        // 如果未存在customer ID，此时，以全局zipcode更新到cart
        const posStorageCityString = persistenceHandles.city.getItem();
        const posStorageCity = posStorageCityString ? JSON.parse(posStorageCityString) : null;
        if (posStorageCity && posStorageCity.zipcode !== cartZipcode.zipcode) {
          dispatch(noticeCityInfoUpdated(posStorageCity)); // 防御性更新全局zipcode
          await dispatch(
            updateZipcodeInCart.initiate({
              zipcode: posStorageCity.zipcode,
              countryState: posStorageCity.state,
              city: posStorageCity.city,
            })
          );
        }
      }
    }
  }
);
