import { ProductDetailsEntryClient } from './product-details-entry.client';

interface ProductDetailsEntryServerProps {
  promise: Promise<any>;
}

export const ProductDetailsEntryServer = async ({ promise }: ProductDetailsEntryServerProps) => {
  try {
    await promise;

    return <ProductDetailsEntryClient />;
  } catch {
    return null;
  }
};
