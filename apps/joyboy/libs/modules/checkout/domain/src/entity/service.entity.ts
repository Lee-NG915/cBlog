/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ServiceProductType {
  type: string;
  name: string;
  hint: string;
  data?: ServiceData[];
  capability?: number;
  price?: string;
  sku: string;
}

export interface ServiceData {
  name: string;
  type: string;
  data: ItemDetail[];
  capability: number;
  disposal_capabilities: DisposalCapability[];
}

export interface ItemDetail {
  price: string;
  sku: string;
  name: string;
}

export interface DisposalCapability {
  capability: number;
  items: Item[];
}
export interface Item {
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

export interface Preferences {
  warning_message?: string;
}

export interface AdditionalShippingService {
  shipment_number: string;
  shipment_id: number;
  available_service_types: AvailableServiceType[];
}

export interface AvailableServiceType {
  display_name: string;
  display_content: string;
  type: string;
  amount: string;
  original_amount: string;
}

export interface AddServiceProductPayload {
  number: string;
  shipment_id: number;
  services: {
    name?: string;
    price: string;
    quantity: number;
    size?: string;
    sku: string;
    type: string;
    custom_attributes?: CustomAttribute;
  }[];
}

export interface CustomAttribute {
  number_of_items?: number;
  number_of_stories?: number;
  disposal_item_size?: string;
  disposal_item_type?: string;
}
