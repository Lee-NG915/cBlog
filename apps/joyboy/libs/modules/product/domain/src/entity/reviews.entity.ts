import type { Image, ProductTaxon, VariantOptionValue } from './product.entity';
export interface GlobalReviewSummary {
  average_rating: number;
  total_count: number;
  reviews: GlobalReview[];
}

export interface GlobalReviewResponse {
  current_page: number;
  total_pages: number;
  count: number;
  per_page: number;
  results: GlobalReview[];
}
export interface GlobalReview {
  id: number;
  country: string;
  title: string;
  content: string;
  rating: number;
  order_number: string;
  user_id: number;
  variant_code: string;
  is_anonymous: boolean;
  is_featured: boolean;
  incentive_type: string;
  incentive_value?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  attachments: ReviewAttachment[];
  replies: any[];
  relation_type: string;
  variant: GlobalReviewVariant;
}

export interface ReviewAttachment {
  key: string;
  resource_type: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalReviewVariant {
  id: number;
  name: string;
  product_name: string;
  variant_option_values: VariantOptionValue[];
  price: string;
  list_price: string;
  images: Image[];
  product_taxons: ProductTaxon[];
  sku: string;
  product_slug: string;
  product_type: string;
  is_enabled: boolean;
  is_available: boolean;
}
