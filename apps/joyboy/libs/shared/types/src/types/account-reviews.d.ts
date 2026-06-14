import { Variant } from './line-item.entity';
export interface ReviewItem {
  id: number;
  country: string;
  title: string;
  content: string;
  rating: number;
  updated_at: string;
  created_at: string;
  order_number: string;
  user_id: number;
  variant_code: string;
  is_anonymous: boolean;
  user_name: string;
  is_featured: boolean;
  relation_type: string;
  incentive_type: null;
  attachments: AttachmentsItemType[];
  replies: ReplyItemType[];
  variant: Variant;
  bundle_options?: ReviewBundleOption[];
  status: string;
}

export interface ReviewResponse {
  count: number;
  current_page: number;
  per_page: number;
  results: ReviewItem[];
  total_pages: number;
}

export type ReviewBundleOption = {
  id: number;
  name: string;
  presentation: string;
  position: number;
  default_quantity: number;
  frontend_viewable: boolean;

  bundle_option_type: 'configurable';
  option_types: OptionType[];
  variant: Variant[];
};

export interface AttachmentsItemType {
  key: string;
  resource_type: string;
  url: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface ReplyItemType {
  id: number;
  content: string;
  review_id: string;
  replied_by: null;
  created_at: string;
  updated_at: string;
  attachments: AttachmentsItemType[];
  attachmentsZoom: string[];
  attachmentsReal: { image_url: string; clickHandler?: () => void }[];
}
