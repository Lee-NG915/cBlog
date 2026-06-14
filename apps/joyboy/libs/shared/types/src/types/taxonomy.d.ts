/**
 * FAQ 项目结构
 */
export interface TaxonomyFaq {
  question: string;
  answer: string;
}

/**
 * 原始API响应结构（包含children包装）
 */
export interface OriginalTaxonomyResponse {
  children: FullTaxonomyItem[];
}

/**
 * 原始完整的分类数据结构（从后端API返回）
 */
export interface FullTaxonomyItem {
  name: string;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  url: string;
  seo_content: string;
  faqs: TaxonomyFaq[];
  permalink: string;
  description: string;
  started_at: string;
  ended_at: string;
  outdated_urls: string[];
  image: string;
  image_responsive: string;
  image_with_text: string;
  image_with_text_responsive: string;
  thumbnail: string;
  background_color: string;
  query: string;
  query_deliver_before: string | null;
  countdown_deadline: string | null;
  countdown_color: string;
  social_collection: string;
  children: FullTaxonomyItem[];
}

/**
 * 简化的分类列表项 - 保留原本结构，只裁剪不必要字段
 */
export interface SimplifiedTaxonomyItem {
  name: string;
  permalink: string;
  url: string;
  image: string;
  children: SimplifiedTaxonomyItem[];
}
