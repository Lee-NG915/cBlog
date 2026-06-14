import { EcEnv } from '@castlery/config';

// 基础排序选项接口
export interface SortOption {
  /** 显示标签 */
  label: string;
  /** 实际的索引名（完整的，不需要运行时拼接） */
  value: string;
}

// 直接定义配置，避免过度抽象
const SORT_CONFIG = {
  WEB: {
    // US地区不显示Fast Dispatch
    US: [
      { label: 'Recommendation', value: 'web_product' },
      { label: 'Price: Low to High', value: 'web_product_price_asc' },
      { label: 'Price: High to Low', value: 'web_product_price_desc' },
    ],
    // 其他地区显示所有选项
    default: [
      { label: 'Recommendation', value: 'web_product' },
      { label: 'Fast Dispatch', value: 'web_product_lead_asc' },
      { label: 'Price: Low to High', value: 'web_product_price_asc' },
      { label: 'Price: High to Low', value: 'web_product_price_desc' },
    ],
  },
  POS: {
    US: [
      { label: 'Recommendation', value: 'pos_product' },
      { label: 'Price: Low to High', value: 'pos_product_price_asc' },
      { label: 'Price: High to Low', value: 'pos_product_price_desc' },
    ],
    // 其他地区显示所有选项
    default: [
      { label: 'Recommendation', value: 'pos_product' },
      // { label: 'Fast Dispatch', value: 'pos_product_lead_asc' },
      { label: 'Price: Low to High', value: 'pos_product_price_asc' },
      { label: 'Price: High to Low', value: 'pos_product_price_desc' },
    ],
  },
} as const;

/**
 * 获取当前环境的排序选项
 * @param channel - 渠道类型，可选，默认从环境变量推导
 * @param region - 地区类型，可选，默认从环境变量推导
 * @returns 排序选项数组
 */
export function getSortOptions(channel?: string, region?: string): SortOption[] {
  const effectiveChannel = channel || (EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' ? 'POS' : 'WEB');
  const effectiveRegion = region || EcEnv.NEXT_PUBLIC_COUNTRY;

  const channelConfig = SORT_CONFIG[effectiveChannel as 'WEB' | 'POS'];
  if (!channelConfig) return [];

  return (channelConfig as any)[effectiveRegion] || channelConfig.default || [];
}

// 向后兼容 - 保持原有接口
export type SortByItem = SortOption;
