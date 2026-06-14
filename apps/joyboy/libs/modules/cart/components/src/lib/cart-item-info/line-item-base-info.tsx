'use client';
import { Stack, Typography, Tag, Link, chipClasses } from '@castlery/fortress';
import { Hourglass } from '@castlery/fortress/Icons';
import type { GiftLineItemSchema, LineItemSchema } from '@castlery/types';
import { CartItemName } from '../cart-item-name/cart-item-name';
import { WarrantyInlineButton } from '../warranty-inline-button/warranty-inline-button';
import { WarrantyRemoveButton } from '../warranty-remove-button/warranty-remove-button';
import { getDeliveryTimePresentation } from '@castlery/utils';
import { ProductTypeMapping, enableWarranty } from '@castlery/config';
import { memo, useMemo } from 'react';
import { sharedFeatureService } from '@castlery/shared-services';
import { isItemOutdated } from '@castlery/modules-cart-services';

const ICON_SIZE = '20px';

export const LLTTag = memo(() => {
  return (
    <Tag
      variant="outlined"
      color="warning"
      startDecorator={
        <Hourglass
          sx={{
            '--fortress-icon-width': ICON_SIZE,
            '--fortress-icon-height': ICON_SIZE,
          }}
        />
      }
      sx={{
        maxWidth: 'fit-content',
        whiteSpace: 'wrap',
        [`& .${chipClasses.startDecorator}`]: {
          zIndex: 0,
        },
      }}
    >
      <Typography level="caption2">Long delivery time expected</Typography>
    </Tag>
  );
});

LLTTag.displayName = 'LLTTag';

export const CartItemOptionPresentation = memo(({ item }: { item: LineItemSchema | GiftLineItemSchema }) => {
  const isNormalLineItem = useMemo(
    () => ![ProductTypeMapping.SERVICE, ProductTypeMapping.SWATCH].includes(item.productType as ProductTypeMapping),
    [item.productType]
  );

  const variantOptionsStr = useMemo(
    () => item.variant.variantOptionValues?.map((option) => option.presentation).join(', '),
    [item.variant.variantOptionValues]
  );

  if (!isNormalLineItem) return null;

  return (
    <Typography level="caption1" sx={{ mt: 1, color: (theme) => theme.palette.brand.maroonVelvet[300] }}>
      {variantOptionsStr}
    </Typography>
  );
});

CartItemOptionPresentation.displayName = 'CartItemOptionPresentation';

interface ChangeGiftButtonProps {
  onChangeGift?: () => void;
}

export const ChangeGiftButton = memo(({ onChangeGift }: ChangeGiftButtonProps) => {
  return (
    <Link level="caption1" component="button" variant="primary" onClick={onChangeGift}>
      Change gift
    </Link>
  );
});

ChangeGiftButton.displayName = 'ChangeGiftButton';

interface LeadTimePresentationProps {
  deliveryLeadTimePresentation: string;
  warehouseDisplayName: string;
}

export const LeadTimePresentation = memo(
  ({ deliveryLeadTimePresentation, warehouseDisplayName }: LeadTimePresentationProps) => {
    if (!deliveryLeadTimePresentation) return null;

    return (
      <Typography level="caption1" sx={{ color: (theme) => theme.palette.brand.mono[700] }}>
        {deliveryLeadTimePresentation} from {warehouseDisplayName}
      </Typography>
    );
  }
);

LeadTimePresentation.displayName = 'LeadTimePresentation';

interface LineItemBaseInfoProps {
  item: LineItemSchema | GiftLineItemSchema;
  onChangeGift?: () => void;
}

const isServiceOrSwatch = (productType: string): boolean => {
  return [ProductTypeMapping.SERVICE, ProductTypeMapping.SWATCH].includes(productType as ProductTypeMapping);
};

export function LineItemBaseInfo({ item, onChangeGift }: LineItemBaseInfoProps) {
  const isGift = useMemo(() => item.isGift || item.giftPoolId, [item.isGift, item.giftPoolId]);

  const deliveryLeadTimePresentation = useMemo(() => {
    const { startDeliveryTime, endDeliveryTime, startDispatchTime, endDispatchTime } = item.leadTimeInfo || {};
    return getDeliveryTimePresentation({
      startDeliveryTime,
      endDeliveryTime,
      startDispatchTime,
      endDispatchTime,
    });
  }, [item.leadTimeInfo]);

  const hasWarranty = !!item.warrantyItem?.warrantyOfferId;
  const isMulberryEnabled = sharedFeatureService.isMulberryEnabled();
  const enableShowWarranty = useMemo(() => enableWarranty && !isServiceOrSwatch(item.productType), [item.productType]);

  // [保险接入] MiniCart 行内保险 UI（LineItemBaseInfo 用于 WebCartItemList）
  // 注意: Add 按钮当前仅 isMulberryEnabled 时展示；CA Guardsman 需确认是否应改为 getWarrantyProvider() 或 isGuardsmanEnabled

  const hideDeliveryTimePresentation = useMemo(() => {
    return isItemOutdated(item) || !deliveryLeadTimePresentation;
  }, [item, deliveryLeadTimePresentation]);

  return (
    <Stack direction="column" gap={3}>
      {item.llt && <LLTTag />}
      <Stack>
        <CartItemName item={item} />
        <CartItemOptionPresentation item={item} />
      </Stack>
      {isGift && <ChangeGiftButton onChangeGift={onChangeGift} />}
      {!hideDeliveryTimePresentation && (
        <LeadTimePresentation
          deliveryLeadTimePresentation={deliveryLeadTimePresentation}
          warehouseDisplayName={item.warehouseDisplayName}
        />
      )}

      {enableShowWarranty && (
        <Stack>
          {hasWarranty ? (
            <>
              <Typography level="caption1" sx={{ color: (theme) => theme.palette.brand.mono[700] }}>
                Extended warranty: {item.warrantyItem?.durationMonths} Months / ${item.warrantyItem?.warrantyOfferPrice}
              </Typography>
              <WarrantyRemoveButton targetLineItemId={item.id} />
            </>
          ) : (
            isMulberryEnabled && <WarrantyInlineButton targetLineItemId={item.id} />
          )}
        </Stack>
      )}
    </Stack>
  );
}
