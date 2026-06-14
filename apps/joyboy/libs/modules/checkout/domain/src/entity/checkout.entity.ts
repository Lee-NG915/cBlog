//c
import type {
  ShippingPreferenceTypeEnum,
  AssemblyPreferenceSchema,
  DisposalVariantItemSchema,
  DeliveryServiceTypeEnum,
} from '@castlery/types';

export enum CheckoutStep {
  SHIPPING_ADDRESS = 'SHIPPING_ADDRESS',
  SHIPPING_METHOD = 'SHIPPING_METHOD',
  PAYMENT = 'PAYMENT',
}

export interface TradePartnerItemType {
  firstname: string;
  lastname: string;
  companyname: string;
  entityid: string;
}

export interface CheckoutSessionAction_V2 {
  actionTip: {
    content: string;
  };
  actionType: number; // 1:address delete
}

export interface UpdateShippingMethodPayload {
  shippingType: {
    active: boolean;
    shippingType: ShippingPreferenceTypeEnum;
  };
  deliveryRequests: string;
  assemblyPreference: {
    active: boolean;
    name: AssemblyPreferenceSchema;
  };
  shipment: {
    id: string;
    waiveServiceFee?: boolean;
    preferredDeliveryPeriod?: {
      startTime: string;
      endTime: string;
    };
    deliveryService?: {
      active: boolean;
      id: number;
      name: string;
      serviceType: DeliveryServiceTypeEnum;
      carryUpCapability?: {
        carryUpCapability: number;
        numberOfItems: number;
        numberOfStories: number;
      };
      disposalProducts?: {
        productName: string;
        variants: DisposalVariantItemSchema[];
      }[];
    };
  };
}
