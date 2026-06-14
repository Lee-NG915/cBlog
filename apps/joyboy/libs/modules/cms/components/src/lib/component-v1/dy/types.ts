export interface ProductData {
  group_id: string;
  categories: string[];
  keywords: string[];
  in_stock: boolean;
  publish_time: string;
  name: string;
  url: string;
  image_url: string;
  price: number;
  color: string;
  dy_display_price: string;
  featured: string;
  west_quick_ship: string;
  is_new: string;
  west_good_leadtime: string;
  collection: string;
  left_in_stock: string;
  east_quick_ship: string;
  is_sale: string;
  sale_price: string;
  product_tag: string;
  is_clearance: string;
  spu_name: string;
  east_good_leadtime: string;
  material: string;
  badge_url: string;
  include_swatch: string;
  deliver: string;
  delivery_before_x: string;
  lifestyle_image: string;
  additional_image_link: string;
  shortest_lead_time: string;
  icu: string;
  southeast_quick_ship: string;
  northwest_quick_ship: string;
  southeast_good_leadtime: string;
  northwest_good_leadtime: string;
  regional_icu: string;
  regional_stock: string;
  toShow: string;
  badges: string;
  is_blog: string;
  option_value_material: string;
  blog_description: string;
  product_breadcrumbs: string;
  badgesArr: string[];
  product_short_description: string;
  variant_id: string;
}

export interface DYProduct {
  sku: string;
  productData: ProductData;
  slotId: string;
}
