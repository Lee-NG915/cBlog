'use client';
import { Box, Typography, Stack, Tag } from '@castlery/fortress';
import { Error } from '@castlery/fortress/Icons';
import { toPrice } from '@castlery/utils';
import { usePathname } from 'next/navigation';
import type { AddOnServiceLineItemSchema, LineItemSchema, VariantOptionValueSchema } from '@castlery/types';
import { PosDeleteItemAction } from '../pos-cart-actions/pos-delete-item-action/pos-delete-item-action';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { memo, useMemo } from 'react';
import { ProductTypeMapping } from '@castlery/config';
import { PosWarrantyItem } from '../pos-warranty-item/pos-warranty-item';

export interface PosProductItemProps {
  item: LineItemSchema | AddOnServiceLineItemSchema;
  activeStatus: boolean;
  showWarrantyItem: boolean;
}

const SectionWithOverlay = memo(({ isOutDated, children }: { isOutDated: boolean; children: React.ReactNode }) => (
  <Stack sx={{ position: 'relative' }}>
    {/* {isOutDated && <DisabledOverlay />} */}
    {children}
  </Stack>
));

export const PosProductItem = memo(({ item, activeStatus, showWarrantyItem }: PosProductItemProps) => {
  const { id, quantity, variant, productType, isGift, giftPoolId } = item as LineItemSchema;
  const { bundleLineItems, isRegionOutdated, isPriceOutdated, displayTotal, originalTotal, warrantyItem } =
    item as LineItemSchema;
  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'posProductItem' });

  const inCheckoutPage = usePathname().includes('/checkout');
  const isGiftItem = isGift || !!giftPoolId;
  const isServiceItem = productType === ProductTypeMapping.SERVICE;

  const variantOptions = variant?.variantOptionValues || [];
  const bundleItems = bundleLineItems || [];
  const isOutDated = isRegionOutdated || isPriceOutdated;
  const realPrice = +displayTotal || 0;
  const crossedPriceNum = +originalTotal;

  const showOriginalPrice = useMemo(
    () => !isPriceOutdated && crossedPriceNum !== realPrice && !isServiceItem,
    [crossedPriceNum, realPrice, isServiceItem, isPriceOutdated]
  );

  const outdatedTextColor = isOutDated
    ? 'var(--fortress-palette-brand-mono-500)'
    : 'var(--fortress-palette-brand-maroonVelvet-500)';
  const charcoalColor = isOutDated
    ? 'var(--fortress-palette-brand-mono-500)'
    : 'var(--fortress-palette-brand-maroonVelvet-300)';

  return (
    <Box sx={{ width: '100%' }}>
      {isOutDated && (
        <Tag variant="outlined" color="danger" startDecorator={<Error color="danger" />}>
          <Typography level="caption2" color="danger" textAlign="left">
            {isPriceOutdated ? t('priceOutdated') : t('outOfStock')}
          </Typography>
        </Tag>
      )}

      <Stack
        sx={{
          display: 'grid',
          gridTemplateColumns: activeStatus || isOutDated ? 'auto 24px' : '1fr',
          columnGap: 1,
          alignItems: 'flex-start',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            columnGap: 1,
            display: 'grid',
            gridTemplateColumns: 'auto max-content',
            alignItems: 'flex-start',
            '&>span': { color: outdatedTextColor },
          }}
        >
          <Typography level="body2" sx={{ whiteSpace: 'wrap', textAlign: 'left' }}>
            <b>
              {quantity} {' x '}
            </b>
            {['swatch', 'service'].includes(productType || '') ? variant?.name : variant?.productName}
            {isGiftItem && <Tag sx={{ ml: 1 }}>Gift</Tag>}
          </Typography>
          <Stack alignItems="flex-end">
            <Typography level="caption1" sx={{ fontWeight: 600, color: outdatedTextColor }}>
              {isGiftItem ? toPrice(0, true) : toPrice(realPrice, true)}
            </Typography>
            {!isGiftItem && showOriginalPrice && (
              <Typography
                level="caption2"
                sx={{ textDecoration: 'line-through', color: 'var(--fortress-palette-brand-mono-500)' }}
              >
                {toPrice(crossedPriceNum, true)}
              </Typography>
            )}
          </Stack>
        </Box>
        {id &&
          (isOutDated || activeStatus) &&
          (isOutDated ? (
            <Stack sx={{ position: 'relative', zIndex: 99 }}>
              <PosDeleteItemAction lineItemId={id} isGiftItem={isGiftItem} />
            </Stack>
          ) : (
            <PosDeleteItemAction lineItemId={id} isGiftItem={isGiftItem} />
          ))}
      </Stack>

      <SectionWithOverlay isOutDated={isOutDated}>
        {variantOptions.map((option: VariantOptionValueSchema) => (
          <Typography level="caption2" key={option.optionTypeName} sx={{ color: charcoalColor }}>
            {option.optionTypePresentation}: {option.presentation}
          </Typography>
        ))}
      </SectionWithOverlay>

      <SectionWithOverlay isOutDated={isOutDated}>
        {bundleItems.map((bundle) => (
          <Typography level="caption2" key={bundle.id} sx={{ color: (theme) => theme.palette.brand.charcoal[500] }}>
            {bundle.quantity} x {bundle.variant.name}
          </Typography>
        ))}
      </SectionWithOverlay>

      {inCheckoutPage && !!warrantyItem?.warrantyOfferId && (
        <SectionWithOverlay isOutDated={isOutDated}>
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              '>span': { color: charcoalColor },
            }}
          >
            <Typography level="caption2">Extended Warranty: {warrantyItem.durationMonths} Months</Typography>
            <Typography level="caption2">{toPrice(Number(warrantyItem.warrantyOfferPrice), true)}</Typography>
          </Stack>
        </SectionWithOverlay>
      )}
      {!activeStatus && showWarrantyItem && <PosWarrantyItem item={item as LineItemSchema} isExpanded={false} />}
    </Box>
  );
});

export default PosProductItem;
