export type Shipment = {
  id: number;
  estimated_dispatch_date_presentation: string;
  estimated_delivery_date_presentation: string;
  selected_service_type: SelectedServiceType;
  basic_shipping_fee: string;
  service_fee: string;
  free_shipping_threshold: string;
  waive_service_fee: boolean;
  warehouse_name: string;
  manifest: number[];
  line_items: ShipmentLineItem[];
  estimated_delivery_date_start: string;
  estimated_delivery_date_end: string;
  estimated_dispatch_date: string;
  default_estimated_dispatch_date: string;
  default_estimated_delivery_date: string;
  min_dispatch_date: string;
  max_dispatch_date: string;
  min_delivery_date?: string;
  max_delivery_date?: string;
  messages: Message[];
  available_service_products: any[];
  selected_service_products: any[];
};
export interface Message {
  type: string;
  message: string;
}
export interface SelectedServiceType {
  type: string;
}

export interface LineItem {
  id: number;
  variant_id: number;
  order_id: number;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  cost_price?: string;
  tax_category_id: number;
  adjustment_total: string;
  additional_tax_total: string;
  promo_total: string;
  included_tax_total: string;
  data: Data;
  is_free_item: boolean;
  preferred_stock_location_id?: number;
  sell_price: string;
  manual_discount_total: string;
  on_sale: boolean;
  original_price: string;
  list_name?: string;
  list_position?: number;
  preferred_self_collection: boolean;
  visited_in_offline: boolean;
  bundle_options?: BundleOption[];
}

export interface ShipmentLineItem {
  id: number;
  quantity: number;
  sku: string;
  line_item: LineItem;
}

export interface BundleOption {
  id: number;
  product_id: number;
  presentation: string;
  default_quantity: number;
  option_data: OptionData;
  position: number;
  created_at: string;
  updated_at: string;
  name: string;
  option_product_id: number;
  bundle_option_type: string;
  frontend_viewable: boolean;
  base_price_value_id: number;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OptionData {}
export interface Data {
  warranty_items: WarrantyItems;
}
export interface WarrantyItems {
  duration_months: string;
  warranty_discount: string;
  warranty_offer_id: string;
  warranty_offer_price: string;
  warranty_offer_cost: string;
}

export interface ShipmentsOption {
  delivery_option: DeliveryOption;
  shipments: ShipmentOption[];
}

export interface DeliveryOption {
  can_merge: boolean;
  can_split: boolean;
}

export interface ShipmentOption {
  shipment_number: string;
  shipment_id: number;
  support_late_delivery: boolean;
}
