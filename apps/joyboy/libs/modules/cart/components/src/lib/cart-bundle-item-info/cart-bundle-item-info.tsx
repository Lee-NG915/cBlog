'use client';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import type { BundleLineItem_V2 } from '@castlery/types';

interface CartBundleItemInfoProps {
  bundleItem: BundleLineItem_V2;
}
export function CartBundleItemInfo({ bundleItem }: CartBundleItemInfoProps) {
  const { mobile } = useBreakpoints();
  return (
    <Stack sx={{ gap: mobile ? 0 : 1 }}>
      <Typography level="body2">
        {bundleItem.quantity} x {bundleItem.variant.name}
      </Typography>
      <Stack>
        {bundleItem.variant.variantOptionValues?.map((option) => (
          <Typography level="caption2" sx={{ letterSpacing: '-0.175px' }}>
            {option.optionTypePresentation} : {option.presentation}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}

export default CartBundleItemInfo;
