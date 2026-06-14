import { get as originalGet, post as originalPost } from '@castlery/utils';
import { BUSINESS_DOMAIN, createTrackedGet, createTrackedPost, BusinessPriority } from '@castlery/observability/server';

// PDP (Product Detail Page) 相关请求
export const pdpGet = createTrackedGet(originalGet, {
  domain: BUSINESS_DOMAIN.PRODUCT,
  priority: BusinessPriority.HIGH,
});

// 通用 product 请求（不区分 PDP/PLP）
export const get = createTrackedGet(originalGet, {
  priority: BusinessPriority.MEDIUM,
});

export const post = createTrackedPost(originalPost, {
  priority: BusinessPriority.MEDIUM,
});
