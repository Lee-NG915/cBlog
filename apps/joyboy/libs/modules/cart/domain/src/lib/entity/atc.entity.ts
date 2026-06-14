import { ProductTypeMapping, OnlineAddCartSource, OfflineAddCartSource } from '@castlery/config';

export enum AtcFulfillmentMethod {
  Delivery = 1,
  CashAndCarry = 2,
}

export enum AtcFulfillmentWarehouseTypeEnum {
  Showroom = 1,
  Warehouse = 2,
}

export interface AtcLineItem {
  variantId: number;
  quantity: number;
  salePrice: string;
  currency: string;
  isLowStock: boolean;
  productType: ProductTypeMapping;
  bundleLineItems?: Array<{
    variantId: number;
    quantity: number;
    optionId: number;
  }>;
  giftPoolId?: string;
  warranty?: CartWarrantyPayload;
  warrantyId?: string;
  fulfillmentMethod?: number;
  fulfillmentWarehouseType?: number;
}

export type CartWarrantyVendor = 'mulberry' | 'guardsman';

export interface CartWarrantyPayload {
  vendor: CartWarrantyVendor;
  offerId: string;
}

export interface AtcLineItems {
  lineItems: AtcLineItem[];
}

export interface WebAtcRequestPayload extends AtcLineItems {
  source: OnlineAddCartSource;
}

export interface PosAtcRequestPayload extends AtcLineItems {
  source: OfflineAddCartSource;
}
export interface PosAtcServiceRequestPayload extends AtcLineItems {
  source: OfflineAddCartSource;
}

// 兼容web和pos的请求参数
// 如果EcEnv.NEXT_PUBLIC_CHANNEL为Web，则使用WebAtcRequestPayload
// 如果EcEnv.NEXT_PUBLIC_CHANNEL为Pos，则使用PosAtcRequestPayload
// export type AtcRequestPayload = typeof EcEnv.NEXT_PUBLIC_CHANNEL extends 'WEB' ? WebAtcRequestPayload : PosAtcRequestPayload;
export type AtcRequestPayload = WebAtcRequestPayload | PosAtcRequestPayload | PosAtcServiceRequestPayload;

export type AddGiftToCartRequestPayload =
  | (Pick<AtcLineItem, 'currency' | 'quantity' | 'salePrice' | 'variantId' | 'warrantyId'> & {
      source: OnlineAddCartSource;
      giftPoolId: string;
      coupon?: string;
    })
  | (Pick<AtcLineItem, 'currency' | 'quantity' | 'salePrice' | 'variantId' | 'warrantyId'> & {
      giftPoolId: string;
      source: OfflineAddCartSource;
      coupon?: string;
      fulfillmentMethod: number;
      fulfillmentWarehouseType: number;
    });

/** PUT /api/v1/cart/gift — replace an existing gift line item with a different variant */
export type UpdateGiftInCartRequestPayload =
  | (Pick<AtcLineItem, 'currency' | 'quantity' | 'salePrice' | 'variantId'> & {
      source: OnlineAddCartSource;
      lineItemId: string;
      giftPoolId: string;
      coupon?: string;
    })
  | (Pick<AtcLineItem, 'currency' | 'quantity' | 'salePrice' | 'variantId'> & {
      source: OfflineAddCartSource;
      lineItemId: string;
      giftPoolId: string;
      coupon?: string;
      fulfillmentMethod: number;
      fulfillmentWarehouseType: number;
    });

/**
 * 批量加车成功结果
 */
export interface CreateLineResult {
  /**
   * 错误码
   */
  code: number;
  fulfillmentMethod: number;
  fulfillmentWarehouse: number;
  /**
   * 变体ID
   */
  variantId: number;
}

/**
 * 批量加车失败结果
 */
export interface FailResult {
  /**
   * 错误码
   */
  code: number;
  /**
   * 错误信息
   */
  message: string;
  /**
   * 变体ID
   */
  variantId: number;
  /**
   * 变体名称（SKU Name）
   */
  variantName: string;
}

/**
 * 批量加车响应数据
 * 注意：当所有商品都成功加车时，接口返回 data: null
 */
export interface BatchAtcResponseData {
  createLineResults?: CreateLineResult[];
  failResults?: FailResult[];
}

export interface AtcResponsePayload {
  code: number;
  message: string;
  /** 全部成功时为 null，部分成功/失败时包含详细信息 */
  data: BatchAtcResponseData | null;
}
