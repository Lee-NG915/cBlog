'use client';

import { Box, Typography } from '@castlery/fortress';
import { useState } from 'react';
import type { LineItem, AddonServiceLineItem } from '@castlery/types';
import { ChooseFreeGift } from '@castlery/modules-promotion-components';

export interface PosFreeGiftControlProps {
  item: Partial<LineItem & AddonServiceLineItem>;
  isOutDated?: boolean;
}

export function PosFreeGiftControl({ item, isOutDated }: PosFreeGiftControlProps) {
  const {
    preferred_stock_location,
    preferred_self_collection,
    delivery_lead_time_presentation,
    lead_time_presentation,
    gift_id,
  } = item || {};
  const [isChangeGiftOpen, setIsChangeGiftOpen] = useState(false);
  const handleChangeGift = () => {
    setIsChangeGiftOpen(true);
  };
  const handleCloseChangeGift = () => {
    setIsChangeGiftOpen(false);
  };

  return (
    <>
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              cursor: 'pointer',
            },
            '--fortress-palette-text-primary': 'var(--fortress-palette-brand-terracotta-500)',
            '& svg': {
              fill: 'var(--fortress-palette-brand-terracotta-500)',
            },
            ...(!!isOutDated && {
              position: 'relative',
              zIndex: 99,
            }),
          }}
          onClick={handleChangeGift}
        >
          <Typography level="body2">Change Gift</Typography>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8.93333 19L8 18.0755L14.1333 12L8 5.92453L8.93333 5L16 12L8.93333 19Z" />
          </svg>
        </Box>
        {/* 选择免费礼物 */}

        <Typography
          sx={{
            fontSize: 8,
            color: (theme) => theme.palette.brand.charcoal[500],
          }}
        >
          From {preferred_stock_location?.name || 'Warehouse'}
        </Typography>
        <Typography level="caption1" sx={{ color: (theme) => theme.palette.brand.charcoal[500], mb: 1 }}>
          {preferred_self_collection ? (
            <>Cash & Carry</>
          ) : delivery_lead_time_presentation ? (
            <>Estimated Delivery: {delivery_lead_time_presentation}</>
          ) : (
            <>Dispatch {lead_time_presentation}</>
          )}
        </Typography>
        {isChangeGiftOpen && (
          <Box
            sx={{
              ...(!!isOutDated && {
                position: 'relative',
                zIndex: 99,
              }),
            }}
          >
            <ChooseFreeGift changeGiftId={gift_id} onChangeClose={handleCloseChangeGift} />
          </Box>
        )}
      </Box>
    </>
  );
}

export default PosFreeGiftControl;
