'use client';

import type { WarrantyProvider } from '@castlery/config';
import { Product, Variant } from '@castlery/modules-product-domain';

interface ProductInfoItemProps {
  header: string;
  propertyName: keyof Product['product_properties'];
  action?: string;
  hasWarrantyPlans?: boolean;
  warrantyProvider?: WarrantyProvider;
  expandByDefault?: boolean;
  product?: Product;
  variant?: Variant;
  onAccordionChange?: (expand: boolean) => void;
}

export const ProductInfoItem = (props: ProductInfoItemProps) => {
  void props;

  return null;
};
