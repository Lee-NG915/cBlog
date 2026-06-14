'use client';

import { Box, Divider, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ChevronRight } from '@castlery/fortress/Icons';
import type { ProductDetailsSectionKey } from '@castlery/types';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useCallback } from 'react';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';
import { PRODUCT_DETAILS_ITEMS, PRODUCT_DETAILS_TRACKING_ACTION_MAP } from '../product-details.constants';

interface ProductDetailsTriggerProps {
  onOpen: (section: ProductDetailsSectionKey) => void;
  showAssembly?: boolean;
  showComfort?: boolean;
}

export const ProductDetailsTrigger = ({
  onOpen,
  showAssembly = false,
  showComfort = true,
}: ProductDetailsTriggerProps) => {
  const dispatch = useAppDispatch();
  const items = PRODUCT_DETAILS_ITEMS.filter((item) => {
    if (item.key === 'assembly' && !showAssembly) return false;
    if (item.key === 'seat-comfort' && !showComfort) return false;
    return true;
  });
  const { desktop, mobile } = useBreakpoints();

  const handleOpen = useCallback(
    (section: ProductDetailsSectionKey) => {
      void dispatch(
        EVENT_PDP_DETAILS({
          action: PRODUCT_DETAILS_TRACKING_ACTION_MAP[section],
          label: 'click',
        })
      );
      onOpen(section);
    },
    [dispatch, onOpen]
  );

  return (
    <Box sx={{ my: 4, px: desktop ? 8 : 6 }}>
      {items.map((item) => (
        <Box key={item.key}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            onClick={() => void handleOpen(item.key)}
            sx={{
              py: 3,
              cursor: 'pointer',
            }}
          >
            <Typography level="h5">{item.title}</Typography>
            <ChevronRight />
          </Stack>
          <Divider
            sx={{
              mt: mobile ? 0 : 2,
              mb: 2,
              '--Divider-thickness': '0.5px',
            }}
          />
        </Box>
      ))}
    </Box>
  );
};
