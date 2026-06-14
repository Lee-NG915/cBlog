import type { LineItemSchema } from '@castlery/types';
import type {
  DYAddToCartItemSchema,
  DYLegacyLineItemSchema,
  DYPurchaseCartItemSchema,
  DYRemoveFromCartCartItemSchema,
  DYRemoveFromCartTriggerPayloadSchema,
} from '../entity';

/**
 * @description Track event using DY API
 * @param name - The name of the event
 * @param properties - The properties of the event
 * @see https://support.dynamicyield.com/hc/en-us/articles/360023172893-Events
 * @example
 * dyTrack('page_view', { page: 'home' });
 */
export function trackDy(name: string, properties: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.DY !== 'undefined' && 'API' in window.DY) {
    window.DY.API('event', {
      name,
      properties: properties,
    });
  }
}

/**
 * 将外部传入的金额字段（可能是 string / number / null / undefined）转换为 DY 官方要求的 Float（number）。
 * 非 finite 时兜底为 0（保持上报通路不中断）。
 * @see https://dy.dev/docs/add-to-cart  价格字段说明：dollars.cents
 */
export const toDYPrice = (value: string | number | null | undefined): number => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

/** ATC `cart[]` mapper —— V1 legacy line item（snake_case，`variant.price: string`） */
export const buildDYAddToCartItem = (item: DYLegacyLineItemSchema): DYAddToCartItemSchema => ({
  productId: item.variant.sku,
  quantity: item.quantity,
  itemPrice: toDYPrice(item.variant.price),
});

/** ATC `cart[]` mapper —— V2 新结构（camelCase `LineItemSchema`） */
export const buildDYAddToCartItemV2 = (item: LineItemSchema): DYAddToCartItemSchema => ({
  productId: item.variant.sku,
  quantity: item.quantity,
  itemPrice: toDYPrice(item.variant.price),
});

/**
 * Purchase `cart[]` mapper —— 入参为 `DYLegacyLineItemSchema`（来自 listener `toDYPurchaseOrder`）。
 * 结构与 ATC V1 一致，但保留独立 mapper 以便后续按事件演进（如官方可选 `size` 字段）。
 */
export const buildDYPurchaseCartItem = (item: DYLegacyLineItemSchema): DYPurchaseCartItemSchema => ({
  productId: item.variant.sku,
  quantity: item.quantity,
  itemPrice: toDYPrice(item.variant.price),
});

/**
 * Remove from Cart `cart[]` mapper —— 入参形状来自 {@link DYRemoveFromCartTriggerPayloadSchema.cartLineItems}
 * （`price` 在 line item 顶层，而非 `variant.price`，与 ATC/Purchase 不同）。
 */
export const buildDYRemoveFromCartCartItem = (
  item: DYRemoveFromCartTriggerPayloadSchema['cartLineItems'][number]
): DYRemoveFromCartCartItemSchema => ({
  productId: item.variant.sku,
  quantity: item.quantity,
  itemPrice: toDYPrice(item.price),
});

// setSPAContext @todos: 待迁移 @abby 2025-08-27
export function trackDySpa() {
  if (typeof window !== 'undefined' && typeof window.DY !== 'undefined' && 'API' in window.DY) {
    // window.DY.API('spa', {});
  }
}
