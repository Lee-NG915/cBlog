export interface CollectionItem {
  name: string;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  url: string;
  seo_content: string | null;
  faqs: unknown[] | null; // Replace 'unknown' with a more specific type if the structure of FAQ items is known
  permalink: string;
  description: string;
  started_at: string;
  ended_at: string;
  outdated_urls: string[];
  image: string;
  image_responsive: string;
  image_with_text: string;
  image_with_text_responsive: string;
  thumbnail: string | null;
  background_color: string;
  query: string | null;
  query_deliver_before: string | null;
  countdown_deadline: string | null;
  countdown_color: string | null;
  social_collection: string | null;
  children: CollectionItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CategoryItem {
  name: string;
  nameWithAll?: string; // 可选字段：包含"All"前缀的名称，用于显示"查看全部"选项
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  url: string;
  seo_content: string;
  faqs: FaqItem[] | null;
  permalink: string;
  description: string;
  started_at: string;
  ended_at: string;
  outdated_urls: string[];
  image: string;
  image_responsive: string;
  image_with_text: string;
  image_with_text_responsive: string;
  thumbnail: string | null;
  background_color: string;
  query: string | null;
  query_deliver_before: string | null;
  countdown_deadline: string | null;
  countdown_color: string | null;
  social_collection: string | null;
  children: CategoryItem[]; // Assuming children will also be of type MenuItem
}
