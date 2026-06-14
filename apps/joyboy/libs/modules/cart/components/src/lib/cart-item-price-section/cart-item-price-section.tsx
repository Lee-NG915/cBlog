'use client';
import { Stack, Typography } from '@castlery/fortress';
import type { LineItemSchema } from '@castlery/types';
import { toPrice } from '@castlery/utils';

interface CartItemPriceSectionProps {
  item: LineItemSchema;
  isGift?: boolean;
}

export function CartItemPriceSection({ item, isGift = false }: CartItemPriceSectionProps) {
  const totalSalePrice = Number(item.displayTotal);
  const totalOriginalPrice = Number(item.originalTotal);
  const hasDiscount = totalSalePrice !== totalOriginalPrice;
  const isPriceOutdated = item.isPriceOutdated;

  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {isGift ? (
        <Typography level="h5">Free</Typography>
      ) : (
        <>
          <Typography level="h5">{toPrice(totalSalePrice, true)}</Typography>

          {!isPriceOutdated && hasDiscount && (
            <Typography
              level="h5"
              sx={{
                textDecoration: 'line-through',
                color: (theme) => theme.palette.brand.mono[500],
                ml: 2,
              }}
            >
              {toPrice(totalOriginalPrice)}
            </Typography>
          )}
        </>
      )}
    </Stack>
  );
}

export default CartItemPriceSection;
