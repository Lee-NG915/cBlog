'use client';
import { Stack, Link, CircularProgress } from '@castlery/fortress';
import { useRemoveWarrantyMutation, selectWarrantyLoading } from '@castlery/modules-cart-domain';
import { LineItemSchema } from '@castlery/types';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { loadGuardsmanCartPlansCommand } from '@castlery/modules-cart-services';
import { sharedFeatureService } from '@castlery/shared-services';
import { useState } from 'react';
import { logger } from '@castlery/observability';

/**
 * [保险接入] Cart/MiniCart 行内「Remove plan」
 * - DELETE /api/v1/cart/warranty（或 POS 等价路径）
 * - CA 移除后需 reload loadGuardsmanCartPlansCommand，刷新 guardsmanCartItems eligibility
 * - Mulberry 无 remove_extended_warranty 埋点，Guardsman 亦不对齐实现
 */
interface WarrantyRemoveButtonProps {
  targetLineItemId: LineItemSchema['id'];
}
export function WarrantyRemoveButton({ targetLineItemId }: WarrantyRemoveButtonProps) {
  const dispatch = useAppDispatch();
  const [removeWarranty] = useRemoveWarrantyMutation();
  const warrantyLoading = useAppSelector(selectWarrantyLoading);
  const [actionSymbol, setActionSymbol] = useState<LineItemSchema['id']>();
  const handleRemoveWarranty = async () => {
    try {
      setActionSymbol(targetLineItemId);
      await removeWarranty({ cartItemId: targetLineItemId });
      if (sharedFeatureService.isGuardsmanEnabled()) {
        await dispatch(loadGuardsmanCartPlansCommand());
      }
    } catch (error) {
      logger.error('Failed to remove warranty', { error });
    }
  };
  const isLoading = warrantyLoading && actionSymbol === targetLineItemId;
  return (
    <Stack>
      <Link variant="primary" level="caption1" component="button" underline="always" onClick={handleRemoveWarranty}>
        Remove plan {isLoading && <CircularProgress size={'sm'} sx={{ ml: 0.5 }} />}
      </Link>
    </Stack>
  );
}

export default WarrantyRemoveButton;
