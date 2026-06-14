'use client';
import { Stack, Typography } from '@castlery/fortress';
import { WarrantyItemSchema, LineItemSchema } from '@castlery/types';
import { toPrice } from '@castlery/utils';
import { WarrantyInlineButton } from '../warranty-inline-button/warranty-inline-button';
import { WarrantyRemoveButton } from '../warranty-remove-button/warranty-remove-button';
import { sharedFeatureService } from '@castlery/shared-services';
import { ProductTypeMapping, enableWarranty } from '@castlery/config';

export interface PosWarrantyItemProps {
  item: LineItemSchema;
  isExpanded: boolean;
}

export function PosWarrantyItem({ item, isExpanded }: PosWarrantyItemProps) {
  const { warrantyItem = null, id, productType = '' } = item;
  const { durationMonths = 0, warrantyOfferPrice = 0 } = (warrantyItem as WarrantyItemSchema) || {};
  const isMulberryEnabled = sharedFeatureService.isMulberryEnabled();
  const isGuardsmanEnabled = sharedFeatureService.isGuardsmanEnabled();
  const enableShowWarranty =
    enableWarranty &&
    ![ProductTypeMapping.SERVICE, ProductTypeMapping.SWATCH].includes(productType as ProductTypeMapping);
  if (!enableShowWarranty) return null;

  return (
    <>
      {warrantyItem ? (
        <Stack sx={{ display: 'grid', gridTemplateColumns: 'auto 60px' }}>
          <Typography
            level="caption1"
            sx={{
              color: isExpanded ? 'var(--fortress-palette-brand-mono-700)' : 'var(--fortress-palette-brand-mono-500)',
            }}
          >
            Extended Warranty: {durationMonths} Months
          </Typography>
          <Typography
            level="caption1"
            sx={{
              color: isExpanded ? 'var(--fortress-palette-brand-mono-700)' : 'var(--fortress-palette-brand-mono-500)',
              textAlign: 'right',
            }}
          >
            +{toPrice(Number(warrantyOfferPrice), true)}
          </Typography>
        </Stack>
      ) : null}
      {isExpanded &&
        (warrantyItem ? (
          <WarrantyRemoveButton targetLineItemId={id} />
        ) : (
          (isMulberryEnabled || isGuardsmanEnabled) && <WarrantyInlineButton targetLineItemId={id} />
        ))}
    </>
  );
}

export default PosWarrantyItem;
