import { ZipcodeSchema, SummarySchema, LineItemSchema, AddOnServiceLineItemSchema } from './cart.entity';

export interface CheckoutSessionInfoSchema {
  zipcode: ZipcodeSchema;
  addressInfo: CustomerAddressEntity_V2 | null;
  billAddress: CustomerAddressEntity_V2 | null;
  currency: string;
  count: number;
  lineItems: LineItemSchema[];
  summary: SummarySchema;
  addOnServiceLineItems: AddOnServiceLineItemSchema[];
  gifts: GiftLineItemSchema[];
  actions: CheckoutSessionAction_V2[];
  shippingMethod: CheckoutShippingMethodSchema;
  paymentExpiredAt?: string;
}

export interface ShipmentItemSchema {
  id: string;
  waiveServiceFee: boolean;
  lineItems: {
    lineItemId: LineItemSchema['id'];
    quantity: number;
    skuCode: LineItemSchema['sku'];
  }[];
  amount: {
    actualShippingFee: string;
    freeShippingThreshold: string;
    itemsSubtotal: string;
    originalShippingFee: string;
  };
  deliveryPeriod: {
    estimatedDeliveryStartDate: string;
    estimatedDeliveryEndDate: string;
    preferredDeliveryPeriod: {
      blackoutPeriods: any[];
      calendarPeriod: {
        startDate: string;
        endDate: string;
      };
      deliveryDays: number;
      requestForPreferredDeliveryPeriod: {
        startDate: string;
        endDate: string;
      };
    };
    supportLaterDelivery: boolean;
  };
  dispatchWarehouse: string;
  warehouseDisplayName: string;
  deliveryServices: DeliveryServiceItemSchema[];
}

export interface ShipmentItemWithLineItemsSchema extends Omit<ShipmentItemSchema, 'lineItems'> {
  lineItems: LineItemSchema[];
}

export enum DeliveryServiceTypeEnum {
  DISPOSAL_SERVICE = 'DISPOSAL_SERVICE',
  CARRY_UP_SERVICE = 'CARRY_UP_SERVICE',
  ROOM_OF_CHOICE = 'ROOM_OF_CHOICE',
  STANDARD = 'STANDARD',
  WHITE_GLOVE = 'WHITE_GLOVE',
  STANDARD_SERVICE = 'STANDARD_SERVICE',
}
export interface DeliveryServiceItemSchema {
  active: boolean;
  carryUp: {
    numberOfItems: number;
    numberOfStories: number;
    carryUpCapability: number;
  } | null;
  currency: string;
  description: string;
  id: number;
  name: string;
  originalUnitPrice: string;
  priceMode: string;
  sellingUnitPrice: string;
  serviceType: DeliveryServiceTypeEnum;
  totalAmount: string;
  disposalProducts: DisposalProductItemSchema[] | null;
}

export interface DisposalProductItemSchema {
  productName: string;
  dpCapability: number;
  variants: DisposalVariantItemSchema[];
  type: 'small' | 'medium' | 'large';
}

export interface DisposalVariantItemSchema {
  dvCapability: number;
  originalUnitPrice: string;
  productName: string;
  quantity: number;
  sellingUnitPrice: string;
  variantName: string;
}

export enum AssemblyPreferenceTypeEnum {
  FREE_ASSEMBLY = 'FREE_ASSEMBLY',
  CONTACTLESS_DELIVERY = 'CONTACTLESS_DELIVERY',
}

export interface AssemblyPreferenceSchema {
  name: AssemblyPreferenceTypeEnum;
  active: boolean;
}
export interface CheckoutShippingMethodSchema {
  assemblyPreference: AssemblyPreferenceSchema[] | null;
  canMerge: boolean; // 是否可以合并发货，如果为true，则可以合并发货
  deliveryRequests: {
    // 最大2000字
    enableDeliveryRequest: boolean;
    text: string;
  } | null;
  shipments: ShipmentItemSchema[];
  shippingTypes: ShippingTypeItemSchema[];
}
export enum ShippingPreferenceTypeEnum {
  SHIPPING_TOGETHER = 'SHIPPING_TOGETHER',
  SHIPPING_FASTER = 'SHIPPING_FASTER',
}
export interface ShippingTypeItemSchema {
  active: boolean;
  description?: string;
  shippingType: ShippingPreferenceTypeEnum;
  title?: string;
}

export interface CheckoutSessionAction_V2 {
  actionTip: {
    content: string;
  };
  actionType: number; // 1:address delete
}
