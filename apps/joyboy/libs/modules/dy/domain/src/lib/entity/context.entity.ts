/**
 * @description DynamicYield page types, pagetype must be in all-caps.
 * @see https://dy.dev/docs/page-context#page-context-for-e-commerce to learn pagetypes for e-commerce
 */
export enum DYPageTypes {
  HOME = 'HOMEPAGE',
  CATEGORY = 'CATEGORY',
  PRODUCT = 'PRODUCT',
  CART = 'CART',
  OTHER = 'OTHER',
}

export interface RecommendationContext {
  type: DYPageTypes;
  data: string[];
}
