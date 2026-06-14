export const KnightUrlPaths = {
  PRODUCT: 'product',
};

export const getKnightSuffix = (spuSlug?: string) => {
  return {
    [KnightUrlPaths.PRODUCT]: spuSlug ? `v3/products/${spuSlug}` : '',
  };
};

export const getValidKnightSuffix = (knightSuffix: Record<string, string>) => {
  return Object.values(knightSuffix).filter((path) => path !== '');
};
