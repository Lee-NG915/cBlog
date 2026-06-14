/* eslint-disable @typescript-eslint/no-empty-interface */
export interface LineItem {
  id: number;
  quantity: number;
  list_name: string;
  list_position: number;
  price: string;
  currency: string;
  amount: string;
  total: string;
  is_free_item: boolean;
  is_price_outdated: boolean;
  is_region_outdated: boolean;
  is_gift: boolean;
  is_swatch: boolean;
  visited_in_offline: boolean;
  preferred_self_collection: boolean;
  show_leadtime_explanation: boolean;
  variant: Variant;
  lead_time: number;
  lead_time_presentation: string;
  adjustment_total: string;
  additional_tax_total: string;
  promo_total: string;
  manual_discount_total: string;
  included_tax_total: string;
  product_type: string;
  product_layout: string;
  delivery_lead_time_presentation: string;
  warranty_items: WarrantyItems;
  pair_up_info: string;
  stock_state: string;
  delivery_lead_time: number;
  bundle_line_items?: BundleLineItem[];
  preferred_stock_location: PreferredStockLocation;
  custom_attributes?: CustomAttributes;
  gift_id?: string;
  warehouse_name?: string;
}

export interface Variant {
  id: number;
  name: string;
  available_on: string;
  price: string;
  list_price: string;
  assembly_type: string;
  sku: string;
  lead_time: number;
  product_slug: string;
  product_id: number;
  product_name: string;
  images: Image[];
  product_taxons: ProductTaxon[];
  is_customized: boolean;
  max_sale_qty: number;
  min_sale_qty: number;
  qty_increments: number;
  variant_option_values: VariantOptionValue[];
  sellability: boolean;
  available_channels: string[];
  is_clearance: boolean;
  tags: string[];
  product_type: string;
  price: number;
  list_price: number;
}

export interface WarrantyItems {
  duration_months: string;
  warranty_discount: string;
  warranty_offer_id: string;
  warranty_offer_price: string;
  warranty_offer_cost: string;
}

export interface Image {
  id: number;
  position: number;
  type: string;
  alt: string;
  links: Links;
}

export interface Links {
  mini: string;
  small: string;
  medium: string;
  large: string;
  mini_x2: string;
  small_x2: string;
  medium_x2: string;
  large_x2: string;
  mini_gray: string;
  small_gray: string;
  medium_gray: string;
  large_gray: string;
  mini_x2_gray: string;
  small_x2_gray: string;
  medium_x2_gray: string;
  large_x2_gray: string;
  feed: string;
  large_overlay: string;
  large_x2_overlay: string;
  medium_overlay: string;
  medium_x2_overlay: string;
  mini_overlay: string;
  mini_x2_overlay: string;
  small_overlay: string;
  small_x2_overlay: string;
}

export interface ProductTaxon {
  id: number;
  name: string;
  permalink: string;
  position: number;
  level: number;
  value: string;
  ancestors: string[];
}

export interface VariantOptionValue {
  name: string;
  presentation: string;
  option_type_name: string;
  option_type_presentation: string;
  option_value_id: number;
  option_type_id: number;
}

export interface BundleLineItem {
  id: number;
  quantity: number;
  price: string;
  price_modifier: string;
  bundle_option: BundleOption;
  variant: BundleVariant;
}

export interface PreferredStockLocation {
  id: number;
  name: string;
  code: string;
  support_self_collection: boolean;
  ims_code: string;
}
export interface BundleOption {
  id: number;
  bundle_option_type?: string;
}

export interface BundleVariant {
  id: number;
  name: string;
  available_on: string;
  lead_time: number;
  price: string;
  list_price: string;
  sku: string;
  product_slug: string;
  product_id: number;
  product_name: string;
  images: Image[];
  overlay: Overlay;
  product_taxons: ProductTaxon[];
  is_customized: boolean;
  is_clearance: boolean;
  assembly_type: string;
  max_sale_qty: number;
  min_sale_qty: number;
  qty_increments: number;
  variant_option_values: VariantOptionValue[];
}
export interface Overlay {
  id: number;
  position: number;
  type: string;
  alt: string;
  links: Links;
}
