export type AttachmentsItemType = {
  key: string;
  resource_type: string;
  url: string;
  created_at: string;
};

export type ReplyItemType = {
  id: number;
  content: string;
  review_id: string;
  replied_by: null;
  created_at: string;
  attachments: AttachmentsItemType[];
  attachmentsZoom: string[];
  attachmentsReal: { image_url: string; clickHandler?: () => void }[];
};

export type GlobalReviewInfoVariantType = {
  name: string;
  product_slug: string;
  is_available: boolean;
};

export type GlobalReviewInfoItemType = {
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
  variant: GlobalReviewInfoVariantType;
};

export type GlobalReviewInfoType = {
  loading: boolean;
  data: {
    count: number;
    current_page: number;
    total_pages: number;
    with_picture_count: number;
    results: GlobalReviewInfoItemType[];
  };
  country: string;
  visitedArray: string[];
};

export type GlobalReviewListItemType = {
  id: number;
  info: ReviewInfoProps;
  content: ReviewContentProps;
  tag: string;
  replies: ReplyItemType[];
};

export type RelativeProductType = {
  name: string;
  linkNeeded: GlobalReviewInfoVariantType;
  relation_type: string;
};

export type ReviewContentProps = {
  basedCountry: string;
  title: string;
  content: string;
  attachmentsZoom: string[];
  imageList: { image_url: string; clickHandler?: () => void }[];
  relativeProduct: RelativeProductType;
  updatedAt: string;
  createdAt: string;
  replies: ReplyItemType[];
};

export type ReviewInfoProps = {
  customerName: string;
  rateNum: number;
  location: string;
  reviewStatus: string;
};
