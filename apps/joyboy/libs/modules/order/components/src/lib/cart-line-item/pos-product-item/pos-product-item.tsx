'use client';
import { Box, Typography, Stack } from '@castlery/fortress';
import { Error } from '@castlery/fortress/Icons';
import type { LineItem, VariantOptionValue, AddonServiceLineItem } from '@castlery/modules-order-domain';
import { DeleteItemButton } from '../../pos-cart-buttons/delete-item-button/delete-item-button';
import { outdatedHelperText, calcItemStrikeThroughPrice } from './helper';
import { toPrice } from '@castlery/utils';
import { useMemo } from 'react';
import { DisabledMasker } from '../../disabled-masker/disabled-masker';
import { STOCK_STATE } from '@castlery/utils';
import { usePathname } from 'next/navigation';

export interface PosProductItemProps {
  item: Partial<LineItem & AddonServiceLineItem>;
  activeStatus: boolean;
  removeItem: (itemId: number) => Promise<void>;
}

export const PosProductItem = ({ item, activeStatus, removeItem }: PosProductItemProps) => {
  const {
    id,
    amount,
    bundle_line_items,
    quantity,
    variant,
    product_type,
    is_region_outdated,
    is_price_outdated = false,
    manual_discount_total,
    stock_state,
    warranty_items,
  } = item;
  const inCheckoutPage = usePathname().includes('/checkout');
  const variantOptions: VariantOptionValue[] = variant?.variant_option_values || [];
  const bundleItems = bundle_line_items || [];
  const isOutDated = is_region_outdated || is_price_outdated || stock_state === STOCK_STATE.OUT_OF_STOCK;
  const realPrice = Number(amount) + Number(manual_discount_total || 0);
  const crossedPriceNum = calcItemStrikeThroughPrice(item);
  const isServiceItem = useMemo(() => product_type && ['service'].includes(product_type), [product_type]);

  const showCrossedPrice = toPrice(crossedPriceNum, true) !== toPrice(realPrice, true) && !isServiceItem;

  return (
    <Box sx={{ width: '100%' }}>
      {isOutDated && (
        <Typography
          level="caption2"
          color="danger"
          startDecorator={<Error color="danger" sx={{ '--Icon-fontSize': '24px' }} />}
          sx={{ alignItems: 'flex-start' }}
        >
          {outdatedHelperText(is_price_outdated)}
        </Typography>
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
            gridTemplateColumns: '1fr auto',
            alignItems: 'flex-start',
            '&>span': {
              color: (theme) => (isOutDated ? theme.palette.text.secondary : theme.palette.text.primary),
            },
          }}
        >
          {isOutDated && <DisabledMasker />}
          <Typography
            level="body2"
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              textAlign: 'left',
              minWidth: 0,
            }}
          >
            <b>
              {quantity} {' x '}
            </b>
            {['swatch', 'service'].includes(product_type || '') ? variant?.name : variant?.product_name}
          </Typography>
          {/* TODO------------- 到时用一个方法收拢出来 然后 返回一个数组[price ,price] -------------*/}
          <Stack
            alignItems={'flex-end'}
            sx={{
              minWidth: 'max-content',
              '&>span': {
                color: (theme) => (isOutDated ? theme.palette.text.secondary : theme.palette.text.primary),
              },
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>{toPrice(realPrice, true)}</Typography>
            {showCrossedPrice && (
              <Typography
                level="caption2"
                sx={{
                  textDecoration: 'line-through',
                }}
              >
                {toPrice(crossedPriceNum, true)}
              </Typography>
            )}
          </Stack>
        </Box>
        {isOutDated && id ? (
          <Stack sx={{ position: 'relative', zIndex: 99 }}>
            <DeleteItemButton handler={() => removeItem(id)} />
          </Stack>
        ) : (
          <>{activeStatus && id && <DeleteItemButton handler={() => removeItem(id)} />}</>
        )}
      </Stack>
      {/* ================== variantOptions Section ===================== */}
      <Stack sx={{ position: 'relative' }}>
        {isOutDated && <DisabledMasker />}
        {variantOptions?.map((option: VariantOptionValue) => (
          <Typography
            level="caption1"
            key={option.option_type_id}
            sx={{ color: (theme) => (isOutDated ? theme.palette.text.secondary : theme.palette.brand.charcoal[500]) }}
          >
            {option.option_type_presentation}: {option.presentation}
          </Typography>
        ))}
      </Stack>
      {/* ======================= Bundle Section ===================== */}
      <Stack sx={{ position: 'relative' }}>
        {isOutDated && <DisabledMasker />}
        {bundleItems?.map((bundle) => (
          <Typography level="caption1" key={bundle.id} sx={{ color: (theme) => theme.palette.brand.charcoal[500] }}>
            {bundle.quantity} x {bundle.variant.name}
          </Typography>
        ))}
      </Stack>
      {inCheckoutPage && !!warranty_items && (
        <Stack sx={{ position: 'relative' }}>
          {isOutDated && <DisabledMasker />}
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              '>span': {
                color: (theme) => (isOutDated ? theme.palette.text.secondary : theme.palette.brand.charcoal[500]),
              },
            }}
          >
            <Typography level="caption1">Extended Warranty: {warranty_items.duration_months} Months</Typography>
            <Typography level="caption1">{toPrice(Number(warranty_items.warranty_offer_cost), true)}</Typography>
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default PosProductItem;
