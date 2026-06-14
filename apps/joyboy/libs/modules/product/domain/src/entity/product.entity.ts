/* eslint-disable @typescript-eslint/no-explicit-any */
import { STOCK_STATE } from '@castlery/utils';
import { BundleVariants } from '../slice/product.slice';
import type { GlobalReviewSummary } from './reviews.entity';
export type ProductOption = {
  name: string;
  name_highlight: string;
  type: 'product' | 'category' | 'collection' | 'customized';
  slug: string;
  default_taxon?: string;
  image?: string;
  pathname: string;
};

export type Variants = [
  {
    id: number;
    name: string;
    images: [
      {
        position: number;
        type: 'base' | 'thumbnail';
        links: {
          large: string;
          large_gray: string;
          feed: string;
        };
      }
    ];
  }
];

export type BundleOption = {
  id: number;
  name: string;
  presentation: string;
  position: number;
  default_quantity: number;
  frontend_viewable: boolean;

  bundle_option_type: 'configurable';
  option_types: OptionType[];
  variants: Variant[];
};

export type BundleOptionVariants = {
  [key: string]: Variant & {
    variantName?: string;
    variantInfo?: string;
  };
};

export interface Taxon {
  name: string;
  permalink: string;
  level: number;
  ancestors: string[];
}

export interface Breadcrumb {
  name: string;
  permalink: string;
  level: number;
}

export interface ProductProperty {
  explanation?: string | null;
  is_private: boolean;
  is_public: boolean;
  name: string;
  presentation: string;
  value: string;
  // name: string;
  // presentation: string;
  // value: string;
  // is_public: boolean;
  // is_private: boolean;
  // explanation?: string | null;
}

export interface ProductImage {
  position: number;
  alt?: string | null;
  links: {
    feed: string;
    large: string;
    large_gray: string;
  };
}

export interface ThreedImage {
  position: number;
  alt?: string | null;
  links: {
    feed: string;
    large: string;
    large_gray: string;
  };
}

export interface ImageLinks {
  feed: string;
  large: string;
  large_gray: string;
}

export interface Image {
  position: number;
  type: string;
  thumbnail?: string;
  overlay?: string[];
  links: ImageLinks;
  path?: string;
}

export interface Asset {
  position: number;
  type: string;
  links: {
    feed: string;
    large: string;
    large_gray: string;
  };
}

export interface AssemblyFile {
  id: number;
  filetype: string;
  display_filename: string;
  file_link: string;
  created_at: string;
  filename: string;
}

export interface ProductAssemblyAiData {
  aiVideos: AssemblyFile[];
  aiDocs: AssemblyFile[];
}

export interface VariantOptionValue {
  name: string;
  presentation: string;
  option_value_id: number;
  option_type_id: number;
  option_type_name: string;
  option_type_presentation: string;
}

export interface VariantProperty {
  name: string;
  presentation: string;
  value: string;
  is_public: boolean;
  is_private: boolean;
  explanation?: string | null;
}

export interface Variant {
  id: number;
  name: string;
  overlay: {
    links: {
      large_overlay: string;
      large_x2_overlay: string;
      medium_overlay: string;
      medium_x2_overlay: string;
      mini_overlay: string;
      mini_x2_overlay: string;
      small_overlay: string;
      small_x2_overlay: string;
    };
  };
  sku: string;
  product_id: number;
  price: string;
  sketchfab_3d_model_id?: string | null;
  list_price: string;
  product_slug: string;
  product_name: string;
  is_customized: boolean;
  warning_message?: string | null;
  discontinued: boolean;
  tags: string[];
  badges: string[];
  variant_properties: {
    product_details: VariantProperty[];
    product_dimensions: VariantProperty[];
    delivery_returns: VariantProperty[];
    comfort_ratings: VariantProperty[];
    assembly?: VariantProperty[];
  };
  variant_option_values: VariantOptionValue[];
  dimension_image: ProductImage;
  threed_images: ThreedImage[];
  images: Image[];
  assets: Asset[];
  assembly_files: AssemblyFile[];
  price_modifier?: string;
  furniture_tool_url?: string;
  modular_tool_url?: string;
  configurator_tool_banner_desktop?: { path?: string; links?: { large?: string } };
  configurator_tool_banner_mobile?: { path?: string; links?: { large?: string } };
  room_designer_banner_desktop?: { path?: string; links?: { large?: string } };
  room_designer_banner_mobile?: { path?: string; links?: { large?: string } };
}

export interface OptionValue {
  id: number;
  name: string;
  presentation: string;
  image_url: string;
  color: string | null;
  collection: {
    id: number;
    name: string;
    description: string;
    presentation: string;
    knp_friendly: boolean | null;
    fabric_composition: string;
  };
}
export type ProductOptionTypeName =
  | 'material'
  | 'color'
  | 'size'
  | 'orientation'
  | 'leg_color'
  | 'orientation_sofa_type'
  | 'ottoman';
// Product Option Type

export interface OptionType {
  id: number;
  name: ProductOptionTypeName;
  presentation: string;
  values: OptionValue[];
}

export interface Customization {
  variant_id: number;
  option_types: string;
  is_customized: boolean;
  discontinued: boolean;
  swatch_id: number;
  batch: number;
}

export interface Review {
  id: number;
  product_id: number;
  status: string;
  rating_product: number;
  relative_product_ids: any[];
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  is_related: boolean;
  variant: {
    id: number;
    name: string;
    price: string;
    sku: string;
    product_name: string;
    product_slug: string;
    product_type: productType;
    is_enabled: boolean;
    list_price: string;
    images: {
      position: number;
      type: string;
      links: {
        feed: string;
        large: string;
        large_gray: string;
      };
    }[];
    product_taxons: Taxon[];
    variant_option_values: VariantOptionValue[];
  };
  bundle_options: BundleOption[];
  messages: {
    id: number;
    created_at: string;
    updated_at: string;
    is_official: boolean;
    title: string;
    anonymous: boolean;
    content: string;
    user: {
      id: number;
      firstname: string;
      lastname: string;
    };
    target_user: any | null;
    count_like: number;
    images: {
      image_url: string;
      ratio: number;
    }[];
  }[];
  incentive: {
    level: string;
  };
}

export interface ReviewsData {
  avg_rating: number;
  best_rating: number;
  worst_rating: number;
  count: number;
  show_related_reviews: boolean;
  reviews: Review[];
}

export interface RelatedProduct {
  label: string;
  name: string;
  id: number;
  product_slug: string;
  sku?: string;
  image_url?: string;
  image?: string;
}

export interface VariantSummary {
  sku?: string;
  image_url?: string;
  image?: string;
}

export type productType = 'bundle' | 'configurable';
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  product_type: productType;
  price: string;
  tags: string[];
  max_sale_qty: number;
  min_sale_qty: number;
  qty_increments: number;
  show_free_swatch: boolean;
  product_layout: string;
  warning_message: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  available_on: string;
  list_price: string;
  discontinued: boolean;
  taxons: Taxon[];
  breadcrumbs: Breadcrumb[];
  product_properties: {
    product_details: ProductProperty[];
    product_dimensions: ProductProperty[];
    delivery_returns: ProductProperty[];
    comfort_ratings: ProductProperty[];
    assembly?: ProductProperty[];
  };
  related_products: RelatedProduct[];
  variant_summaries?: VariantSummary[];
  collections: number[];
  reviews: ReviewsData | GlobalReviewSummary;
  variants: Variant[];
  option_types: OptionType[];
  bundle_options?: BundleOption[];
  customizations: Customization[];
  dimension_image?: ProductImage;
  cross_sell?: any[];
  is_swatch: boolean;
}

export interface LeadTimeShippingFeeReq {
  quantity: number;
  variant_id: number;
  stock_location_id?: string;
  options?: {
    bundle_options?: BundleVariants['bundle_options'];
  };
  zipcode?: string;
  order_number?: string;
  city?: string;
  state?: string;
}

export interface LeadTimeShippingFee {
  price: string;
  lead_time: number;
  requested_quantity: number;
  variant_id: number;
  available_quantity: number | null;
  units_left: number | null;
  eol_date: string | null;
  next_version_sku: string | null;
  warehouse_name: string | null;
  stock_state: (typeof STOCK_STATE)[keyof typeof STOCK_STATE];
  delivery_lead_time: number;
  end_delivery_time: number;
  list_price: string;
  original_amount: string;
  actual_amount: string;
  lead_time_presentation: string;
  delivery_lead_time_presentation: string;
  show_leadtime_explanation: boolean;
  retail_ids?: number[];
  retail_details?: RetailDetail[];
}

export interface RetailDetail {
  id: number;
  name: string;
  address: string;
  map_url: string;
  operating_hours: string;
  parking_info: string;
  stock_state: 'IN_STOCK' | 'OUT_OF_STOCK' | 'IN_STOCK_SOON';
  pickup_state: 'IN_STOCK' | 'OUT_OF_STOCK' | 'IN_STOCK_SOON';
}

export interface Total {
  value: number;
  relation: string;
}

export interface Taxon {
  name: string;
  permalink: string;
  position: number;
  level: number;
  value: string;
  ancestors: string[];
}

export interface Category {
  name: string;
  permalink: string;
}

// 基础图片链接接口 - 抽取重复的图片链接字段
export interface BaseImageLinks {
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
}

// 变体图片链接
export type VariantImage = BaseImageLinks;

// 生活方式图片链接
export type Life_style_image = BaseImageLinks;

export interface Orientation {
  value: string;
  presentation: string;
  image_src: string;
}

export interface OptionValueItem {
  value: string;
  presentation: string;
  image_src: string;
}

export interface Option_value {
  [key: string]: OptionValueItem;
}

export interface Property {
  assembly_condition: string;
  general_dimensions: string;
  packaging_dimensions: string;
  overall_sit_rating: number;
  seat_height_rating: number;
  seat_depth_rating: number;
  seat_softness_rating: number;
  length: number;
  material_filter: string[];
  product_weight: string;
  max_bearing_support: string;
}

export interface VariantItem {
  id: number;
  name: string;
  sku: string;
  color: string;
  lead_time: number;
  lead_time_presentation: string;
  in_stock_regions: any[];
  product_short_description: string;
  price: string;
  list_price: string;
  is_customized: boolean;
  available_quantity: number;
  tags: string[];
  badges: string[];
  images: VariantImage[];
  life_style_image: BaseImageLinks;
  option_values: Option_value;
  properties: Property;
}

export interface _source {
  id: number;
  name: string;
  slug: string;
  price: number;
  product_type: string;
  product_layout: string;
  rank: number;
  styles: any[];
  taxons: Taxon[];
  category_count: number;
  categories: Category[];
  images: any[];
  variants: VariantItem[];
}

export interface HitSub {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: _source;
  sort: number[];
}

export interface Hit {
  total: Total;
  max_score?: any;
  hits: HitSub[];
}

export interface ProductSearchResult {
  took: number;
  timed_out: boolean;
  hits: Hit;
  errorTips: string;
}

export interface SocialUgc {
  ugc_id: number;
  author: string;
  variant_ids: number[];
  asset_url: string;
  start_offset: number;
  caption: string;
  source: string;
  file_type: 'image' | 'video';
}

export interface SocialUgcResult {
  variant_id: number;
  social_ugcs: SocialUgc[];
}

export interface MappedSocialUgcItem {
  media: string;
  ig_handle: string;
  content: string;
  variants?: string;
  fileType: 'image' | 'video';
  startOffset?: number;
  component: string;
  _uid: number;
}

// /variants?ids=xxx,xxx,xxx 接口返回对象类型
export interface ProductVariantDetail {
  id: number;
  name: string;
  sku: string;
  price: string;
  list_price: string;
  lead_time: number;
  available_quantity: number;
  product_id: number;
  product_slug: string;
  product_layout: string;
  is_customized: boolean;
  product_name: string;
  product_type: productType;
  max_sale_qty: number;
  min_sale_qty: number;
  qty_increments: number;
  product_taxons: ProductTaxon[];
  tags: string[];
  badges: string[];
  images: ProductVariantImage[];
  variant_option_values: ProductVariantOptionValue[];
  breadcrumbs: ProductBreadcrumb[];
  image_3D?: string;
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

export interface ProductVariantImage {
  id: number;
  position: number;
  type: string;
  links: ProductVariantImageLinks;
}

export interface ProductVariantImageLinks extends BaseImageLinks {
  public: string;
}

export interface ProductVariantOptionValue {
  option_value_id: number;
  name: string;
  presentation: string;
  option_type_id: number;
  option_type_name: string;
  option_type_presentation: string;
}

export interface ProductBreadcrumb {
  name: string;
  permalink: string;
  level: number;
}

declare global {
  interface Window {
    Zip?: {
      Widget?: {
        setup: () => void;
      };
    };
  }
}

export type Combination = {
  id: number;
  availableForSale: boolean;
  is_customized: boolean;
  [key: string]: string | boolean | number; // ie. { color: 'Red', size: 'Large', ... }
};

/**
 * 产品选项值配置接口 - 用于产品配置页面的选项值
 * 基于 OptionValue 扩展，添加了选中状态和交互逻辑
 */
export interface ProductOptionValueConfig {
  /** 选项值ID（字符串形式） */
  id: string;
  /** 选项值名称 */
  name: string;
  /** 选项值展示 */
  value: string;
  /** 显示标签 */
  label: string;
  /** 选项图片URL */
  image?: string;
  /** 所属 collection */
  collection: OptionValue['collection'];
  /** 是否被选中 */
  isSelected: boolean;
  /** 是否为定制选项 */
  isCustomized: boolean;
  /** 选择时的回调函数 */
  onSelect: () => void;
}
