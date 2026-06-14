/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
import type { LineItem } from './line-item.entity';

export interface Order {
  id: number;
  number: string;
  state: string;
  currency: string;
  store_id: number;
  item_count: number;
  total: string;
  created_at: string;
  updated_at: string;
  create_type: string;
  name: string;
  user_id: number;
  email: string;
  zipcode: string;
  city: string;
  item_total: string;
  adjustment_total: string;
  shipment_total: string;
  promo_total: string;
  additional_tax_total: string;
  included_tax_total: string;
  tax_total: string;
  payment_total: string;
  warranty_total: string;
  estimated_shipment_total: EstimatedShipmentTotal;
  fulfillment_order_id: boolean;
  line_items: LineItem[];
  payments: Payment[];
  addon_service_line_items: AddonServiceLineItem[];
  warranty_line_items: WarrantyLineItem[];
  shipments: Shipment[];
  free_shipping_threshold: string | null;
  promotions: PromotionItem[];
  delivery_option_manager?: DeliveryOptionManager;
  warning_messages: WarningMessage[];
  first_purchase: boolean;
  available_assembly_preferences: AvailableAssemblyPreference[];
  selected_assembly_preferences: SelectedAssemblyPreference[];
  exchange_order_number: any;
  available_gift_promotions: any[];
  ship_address?: ShipAddress;
  bill_address?: BillAddress;
  special_instructions?: string;
  coupon?: Coupon;
}

export interface WarrantyLineItem {
  warranty_offer_id: string;
  warranty_offer_price: string;
  duration_months: string;
  warranty_discount: string;
}

export interface WarningMessage {}

export interface AvailableAssemblyPreference {
  slug: string;
  title: string;
  description: string;
}
export interface SelectedAssemblyPreference {
  slug: string;
  title: string;
  description: string;
}

export interface EstimatedShipmentTotal {
  original_amount: number;
  actual_amount: number;
  promotion_amount: number;
}

export interface PromotionItem {
  name: string;
  amount: string;
  description: string;
  adjustable_type: string;
  promotion: Promotion;
}

export interface Promotion {
  id: number;
  status: boolean;
  name: string;
  starts_at: string;
  expires_at: string;
  description: string;
  usage_limit: number;
  per_code_usage_limit: number;
  stop_further_rules_processing: boolean;
  priority: number;
  promotion_rules: PromotionRule[];
  promotion_actions: PromotionAction[];
}

export interface PromotionRule {
  id: number;
  promotion_id: number;
  type: string;
  preferences: string;
}

export interface PromotionAction {
  id: number;
  promotion_id: number;
  type: string;
  preferences: string;
  calculator: Calculator;
}

export interface Calculator {
  id: number;
  type: string;
  preferences: string;
}

export interface Coupon {
  code: string;
  amount: string;
  free_shipping: boolean;
}

export interface BillAddress {
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

export interface ShipAddress {
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

export interface AddonServiceLineItem {
  id: number;
  quantity: number;
  price: string;
  currency: string;
  amount: string;
  total: string;
  product_type: string;
  product_name: string;
  variant: AddonServiceVariant;
  adjustment_total: string;
  additional_tax_total: string;
  promo_total: string;
  included_tax_total: string;
}

export interface AddonServiceVariant {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: string;
}

export interface Shipment {
  id: number;
  estimated_dispatch_date: string;
  min_dispatch_date: string;
  service_detail: ServiceDetail;
  manifest: number[];
  messages: Message[];
  estimated_dispatch_date_presentation: string;
  estimated_delivery_date_presentation: string;
  selected_service_type: SelectedServiceType;
  basic_shipping_fee: string;
  service_fee: string;
  free_shipping_threshold: string;
  waive_service_fee: boolean;
  warehouse_name: string;
  estimated_delivery_date_start: string;
  estimated_delivery_date_end: string;
  default_estimated_dispatch_date: string;
  default_estimated_delivery_date: string;
  max_dispatch_date: string;
  min_delivery_date: string;
  max_delivery_date: string;
  available_service_products?: AvailableServiceProduct[];
  selected_service_products?: SelectedServiceProduct[];
}
export interface SelectedServiceProduct {
  //to be confirmed
  id: number;
  name: string;
  hint: string;
  type: string;
  custom_attributes: CustomAttribute;
}

export interface AvailableServiceProduct {
  type: string;
  name: string;
  hint: string;
  data?: AvailableServiceProductItem[];
  capability?: number;
  price?: string;
  sku?: string;
}
export interface AvailableServiceProductItem {
  name: string;
  type: string;
  data: AvailableServiceProductItemDetail[];
  capability: number;
  disposal_capabilities: DisposalCapability[];
}

export interface AvailableServiceProductItemDetail {
  price: string;
  sku: string;
  name: string;
}

export interface DisposalCapability {
  capability: number;
  items: DisposalCapabilityItem[];
}

export interface DisposalCapabilityItem {
  id: number;
  sku: string;
  weight: string;
  height: any;
  width: any;
  depth: any;
  deleted_at: any;
  is_master: boolean;
  product_id: number;
  cost_price: any;
  position: number;
  cost_currency: string;
  track_inventory: boolean;
  tax_category_id: any;
  updated_at: string;
  created_at: string;
  is_searchable: boolean;
  name: string;
  slug: string;
  is_adhoc: boolean;
  customization_key: string;
  release_date: string;
  can_be_part: boolean;
  color_tone: string;
  status: string;
  assemblies_parts_count: number;
  chargeable_weight: string;
  available_to_web: boolean;
  available_to_pos: boolean;
  available_to_ios: boolean;
  threed_image_status: boolean;
  retire_inventory_color: boolean;
  ar_enable: any;
  last_published_at: any;
  product_feed_image_url?: string;
  ar_object_url: any;
  ar_texture_url: any;
  ar_shadow_url: any;
  product_feed_title?: string;
  product_feed_description?: string;
  product_feed_color?: string;
  product_feed_material?: string;
  product_feed_size?: string;
  dy_keywords?: string;
  ar_status: any;
  ar_glass_url: any;
  enabled_feed_test: boolean;
  enabled_feed_test_title?: string;
  enabled_feed_test_description?: string;
  use_cloudinay_image: boolean;
  preferences: Preferences;
  product_feed_short_title?: string;
  batch: number;
  stock_updated_at: string;
  sketchfab_3d_model_id: any;
  assembly_type: any;
  wg_applicable: boolean;
  swatch_id: any;
  facebook_ad_priority: string;
  product_short_description: any;
  furniture_tool_url: any;
  modular_tool_url: any;
  available_region_list: any[];
}
interface Preferences {
  warning_message?: string;
}

export type CustomAttribute =
  | {
      disposal_item_type?: string;
      disposal_item_size?: string;
    }
  | { number_of_stories: number; number_of_items: number };

export interface ServiceDetail {
  level: string;
  detail: string;
}

export interface Message {
  type: string;
  message: string;
}

export interface SelectedServiceType {
  type: string;
}

export interface Payment {
  id: number;
  amount: string;
  state: string;
  description: string;
  source: Source;
}

export interface Source {
  id: number;
  payment_method: string;
  payment_type: string;
  card_number: string;
  remarks: string;
  checkout_id: string;
  charge_id: string;
}

export interface DeliveryOptionManager {
  can_split: boolean;
  can_merge: boolean;
  delivery_date_shipment_id?: number;
}
