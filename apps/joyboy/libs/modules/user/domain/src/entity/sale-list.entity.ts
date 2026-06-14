/* eslint-disable */
import { LineItem } from '@castlery/modules-order-domain';

interface Address {
  id: number;
  firstname: string;
  lastname: string;
  address1: string;
  address2: string;
  city: string;
  zipcode: string;
  phone: string;
  alternative_phone: string;
  company: string;
  state: string;
  state_name: string;
  country: string;
  street: string;
  building_name: string;
  street_number: string;
  level: string;
  flat: string;
  is_manual: boolean;
  is_temporary: boolean;
  is_valid: boolean;
  is_shippable: boolean;
  building_type: string;
}

interface PaymentSource {
  id: number;
  payment_method: string;
  payment_type: string;
  remarks: string;
}

interface Payment {
  id: number;
  amount: string;
  state: string;
  description: string;
  source: PaymentSource;
}

interface AssemblyPreference {
  slug: string;
  title: string;
}

interface Promotion {
  adjustable_type: string;
  name: string;
  description: string;
  amount: string;
}

interface Shipment {
  manifest: any;
  id: number;
  number: string;
  state: string;
}

// interface LineItem {
//   manual_discount_total: any;
//   id: any;
//   gift_id: string;
// }

export interface Order {
  coupon: any;
  additional_tax_total: string;
  addon_service_line_items: any[];
  adjustment_total: string;
  basic_shipping_fee_total: string;
  bill_address: Address;
  completed_at: string;
  confirmation_delivered: boolean;
  create_type: null;
  created_at: string;
  currency: string;
  email: string;
  exchange_order_number: string;
  id: number;
  included_tax_total: string;
  item_count: number;
  item_total: string;
  line_items: LineItem[];
  number: string;
  order_status: string;
  payment_state: string;
  payment_total: string;
  payments: Payment[];
  promo_total: string;
  promotions: Promotion[];
  reference_number: string;
  selected_assembly_preferences: AssemblyPreference[];
  service_fee_total: string;
  ship_address: Address;
  shipment_state: string;
  shipment_total: string;
  shipments: Shipment[];
  special_instructions: string;
  state: string;
  store_id: number;
  tax_total: string;
  total: string;
  updated_at: string;
  user_id: number;
  warranty_line_items: any[];
  warranty_total: string;
  warranty_total_discount: string | number;
}

export interface SaleListResp {
  count: number;
  current_page: number;
  results: Order[];
  total_pages: number;
}

export interface SaleListReq {
  page: number;
  per_page: number;
}

export type SaleUser = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  channel: 'web' | 'pos';
  phone: string;
};

export type GetSaleUsersResp = {
  results: SaleUser[];
  count: number;
  current_page: number;
  total_pages: number;
};
