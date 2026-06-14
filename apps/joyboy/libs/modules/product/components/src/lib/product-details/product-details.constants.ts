import { enableGuarantee } from '@castlery/config';
import type { ProductDetailsSectionKey } from '@castlery/types';

export const PRODUCT_DETAILS_ITEMS: Array<{ key: ProductDetailsSectionKey; title: string }> = [
  { key: 'dimensions', title: 'Dimensions' },
  { key: 'seat-comfort', title: 'Seat comfort' },
  { key: 'materials', title: 'Materials' },
  { key: 'delivery', title: `Delivery, ${enableGuarantee ? 'guarantee' : 'warranty'} and returns` },
  { key: 'assembly', title: 'Assembly' },
];

export const PRODUCT_DETAILS_TRACKING_ACTION_MAP: Record<ProductDetailsSectionKey, string> = {
  dimensions: 'Dimensions',
  'seat-comfort': 'Seat comfort',
  materials: 'Materials',
  delivery: 'Delivery,warranty and returns',
  assembly: 'Assembly',
};
