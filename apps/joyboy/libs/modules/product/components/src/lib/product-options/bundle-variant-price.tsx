'use client';
import { BundleOption, selectBundleVariants, Variant } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { Box, Typography } from '@castlery/fortress';
import { useEffect, useState } from 'react';
/* eslint-disable-next-line */
export interface BundleVariantPriceProps {
  bundleOption?: BundleOption[];
  variant?: Variant;
}

export const BundleVariantPrice = ({ bundleOption, variant }: BundleVariantPriceProps) => {
  const reduxVariant = useAppSelector(selectBundleVariants);
  const [currentPrice, setCurrentPrice] = useState<string>();
  const [currentListPrice, setCurrentListPrice] = useState<string>();
  useEffect(() => {
    if (reduxVariant && bundleOption) {
      const { bundle_options } = reduxVariant;
      let tempPrice = Number(variant?.price) || 0;
      let tempListPrice = 0;
      bundle_options.forEach((item) => {
        bundleOption.forEach((option) => {
          if (item.bundle_option_id === `${option.id}`) {
            option.variants.forEach((subVariant) => {
              if (subVariant.id === item.bundle_option_variant_id) {
                // tempPrice += Number(subVariant.price) * option.default_quantity;
                tempListPrice += Number(subVariant.list_price) * option.default_quantity;
                if (subVariant?.price_modifier) {
                  tempPrice += Number(subVariant.price_modifier) * option.default_quantity;
                }
              }
            });
          }
        });
      });
      setCurrentPrice(`$${tempPrice.toFixed(0)}`);
      setCurrentListPrice(`$${tempListPrice.toFixed(0)}`);
    }
  }, [reduxVariant, bundleOption, variant]);
  if (!bundleOption && !reduxVariant) return null;

  if (currentPrice !== currentListPrice) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Typography
          sx={{
            color: (theme) => theme.palette.brand.terracotta[500],
            marginRight: '10px',
          }}
        >
          {currentPrice}
        </Typography>
        <Typography
          sx={{
            color: (theme) => theme.palette.brand.charcoal[800],
            textDecoration: 'line-through',
          }}
        >
          {currentListPrice}
        </Typography>
      </Box>
    );
  }
  return (
    <Box>
      <Typography
        sx={{
          color: (theme) => theme.palette.brand.charcoal[800],
          fontWeight: 600,
        }}
      >
        {currentPrice}
      </Typography>
    </Box>
  );
};
