'use client';

import { useAppSelector } from '@castlery/shared-redux-store';
import { selectProduct, selectSwatches, selectSwatchLoading, Swatch } from '@castlery/modules-product-domain';
import { useMemo } from 'react';

interface UseSwatchCollectionProps {
  activeValue?: string;
}

export const useSwatchCollection = (props: UseSwatchCollectionProps) => {
  const { activeValue } = props;
  const product = useAppSelector(selectProduct);
  const swatches = useAppSelector(selectSwatches);
  const swatchLoading = useAppSelector(selectSwatchLoading);
  const collections: Swatch[] = useMemo(() => {
    if (product?.id && swatches?.data) {
      return swatches?.data?.map((swatch) => ({
        ...swatch,
        variants: swatch?.variants?.filter((v) => !v?.is_customized),
      }));
    }
    return [];
  }, [product?.id, swatches?.data]);
  const aliveCollections: Swatch[] = useMemo(
    () => collections?.filter((collection) => collection?.variants?.length),
    [collections]
  );

  const activeCollection: Swatch = useMemo(() => {
    if (activeValue && aliveCollections) {
      return aliveCollections?.find((it) =>
        it?.variants?.some(
          (v) =>
            v?.presentation?.toLowerCase()?.startsWith(activeValue?.toLowerCase()) ||
            activeValue?.toLowerCase()?.startsWith(v?.presentation?.toLowerCase())
        )
      ) as Swatch;
    }
    return {} as Swatch;
  }, [activeValue, aliveCollections]);

  return {
    activeCollection,
    aliveCollections,
    swatchLoading,
  };
};
