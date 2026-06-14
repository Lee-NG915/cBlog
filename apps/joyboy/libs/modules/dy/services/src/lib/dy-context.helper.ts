import { DYPageTypes, type RecommendationContext } from '@castlery/modules-dy-domain';

export { DYPageTypes } from '@castlery/modules-dy-domain';
/**
 * @description DynamicYield configurations
 * @param pageType Page type must be in all-caps.
 * @param data string or array of strings, if not provided, it will be an empty array. can't be null.
 * @readonly
 * @doc https://dy.dev/docs/page-context#page-context-for-e-commerce
 * @see https://dy.dev/docs/spa to learn more about all transitions between contexts that generate new page detection.
 */
export const dyRecContext = {
  [DYPageTypes.HOME]: () => ({
    type: DYPageTypes.HOME,
    data: [],
  }),
  [DYPageTypes.CATEGORY]: (categories: string[]) => ({
    type: DYPageTypes.CATEGORY,
    data: categories.join(','),
  }),
  [DYPageTypes.PRODUCT]: (sku: string) => ({
    type: DYPageTypes.PRODUCT,
    data: [sku],
  }),
  [DYPageTypes.CART]: (skus: string[]) => ({
    type: DYPageTypes.CART,
    data: Array.isArray(skus) && skus.length > 0 ? skus : [''],
  }),
  [DYPageTypes.OTHER]: (label: string) => ({
    type: DYPageTypes.OTHER,
    data: label ? [label] : [],
  }),
};
