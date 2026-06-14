import type { OrderDataV1 } from '@castlery/types';

export type UTTConsentTracking = 'granted' | 'denied';

export type UTTUser = { id?: string | number; email?: string } | null | undefined;

// ============ Trigger payload schemas ============

export type UTTConsentTriggerPayloadSchema = {
  mode: 'default' | 'update';
  granted: boolean;
};

export type UTTIdentifyTriggerPayloadSchema = {
  user: UTTUser;
};

export type UTTConversionTriggerPayloadSchema = {
  order: OrderDataV1;
  user: UTTUser;
};

// ============ Event properties schemas (sent to impact.com via `ire`) ============
// data team 规约（详见 temp-docs/utt.events.md §字段规约）：
//   - 用户 ID key：UK = 'customerid'（小写），其他 market = 'customerId'（驼峰）
//   - 邮箱 key：全 market 统一 'customeremail'（小写）
//   - 订单 ID key & 取值：
//       UK = 'orderid'（小写），取 order.number（R 开头）
//       CA = 'orderId'（驼峰），取 order.number（R 开头）
//       US / SG / AU = 'orderId'（驼峰），取 order.referenceNumber

export type UTTConsentEventPropertiesSchema = {
  tracking: UTTConsentTracking;
};

type UTTCustomerIdentity = { customerid: string; customerId?: never } | { customerId: string; customerid?: never };

type UTTOrderIdentity = { orderid: string; orderId?: never } | { orderId: string; orderid?: never };

export type UTTIdentifyEventPropertiesSchema = UTTCustomerIdentity & {
  customeremail: string;
};

export type UTTConversionItemSchema = {
  subTotal: number /** 该 line item 行合计（= 单价 × 数量），来自 `OrderLineItemV1.total` */;
  category: string;
  sku: string;
  quantity: number;
  name: string;
};

export type UTTConversionEventPropertiesSchema = UTTCustomerIdentity &
  UTTOrderIdentity & {
    customeremail: string;
    customerStatus: 'false' | 'true';
    currencyCode: string;
    orderPromoCode: string | undefined;
    Note: string;
    orderDiscount: string;
    orderShipping: number;
    orderTax: number;
    customerCity: string;
    items: UTTConversionItemSchema[];
  };
