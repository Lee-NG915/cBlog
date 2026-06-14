'use client';

import { Box, Sheet, Stack, Typography } from '@castlery/fortress';
import { selectCurrentBundleVariants, selectProduct, selectVariant } from '@castlery/modules-product-domain';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useCallback, useMemo } from 'react';
import { ProductHullabala } from './components/product-hullabala';

interface ProductInfoClientProps {
  pageType: 'pdp' | 'pla';
  children: React.ReactNode;
}

export const ProductInfoClient = (props: ProductInfoClientProps) => {
  const { pageType, children } = props;
  const dispatch = useAppDispatch();

  const product = useAppSelector(selectProduct);
  const variant = useAppSelector(selectVariant);
  const currentBundleVariant = useAppSelector(selectCurrentBundleVariants);
  const selectVariantId = useMemo(() => {
    if (product?.product_type === 'bundle') {
      return currentBundleVariant?.[0]?.id;
    }
    return variant?.id;
  }, [currentBundleVariant, product?.product_type, variant]);

  const description = useMemo(() => {
    return product?.description && product?.description?.replace(/\u00a0/g, ' ');
  }, [product]);

  const handleTrackPDPDetails = useCallback(
    async ({ action, label }: { action: string; label: string }) => {
      await dispatch(
        EVENT_PDP_DETAILS({
          action,
          label,
        })
      );
    },
    [dispatch]
  );

  return (
    <Stack px={{ xs: 6, md: 0 }} mb={{ md: 7, xs: 5 }} data-section="product-info">
      {pageType !== 'pla' && (
        <Sheet variant="solid" sx={{ mt: 4, mb: 4, py: { xs: 4, sm: 6 }, px: 4 }}>
          <Stack>
            <Typography level="body2" sx={{ mb: 2, color: 'var(--fortress-palette-neutral-plainColor)' }}>
              {description}
            </Typography>
            <Box
              onClick={(e) => {
                e.preventDefault();
                handleTrackPDPDetails({ action: 'view_collection', label: 'click' });
              }}
            >
              {children}
            </Box>
          </Stack>
        </Sheet>
      )}
      {pageType !== 'pla' && selectVariantId && <ProductHullabala />}
    </Stack>
  );
};
