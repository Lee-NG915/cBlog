export interface ProductTaxon {
  id: number;
  name: string;
  permalink: string;
  position: number;
  level: number;
  value: string;
  ancestors: any[];
}

export interface Link {
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
  public: string;
}

export interface Image {
  id: number;
  position: number;
  type: string;
  links: Link;
}

export interface VariantOptionValue {
  option_value_id: number;
  name: string;
  presentation: string;
  option_type_id: number;
  option_type_name: string;
  option_type_presentation: string;
}

export interface Breadcrumb {
  name: string;
  permalink: string;
  level: number;
}

export interface WishListItem {
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
  product_type: string;
  max_sale_qty: number;
  min_sale_qty: number;
  qty_increments: number;
  product_taxons: ProductTaxon[];
  tags: string[];
  badges: string[];
  images: Image[];
  variant_option_values: VariantOptionValue[];
  breadcrumbs: Breadcrumb[];
}

export interface TheLookWishListItem {
  shop_the_look_id: string;
  background_image: string;
  variant_ids: number[];
}
