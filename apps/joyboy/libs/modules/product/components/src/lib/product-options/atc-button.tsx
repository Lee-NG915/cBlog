'use client';
import * as React from 'react';
import { Button, NiceModal } from '@castlery/fortress';
import { selectPreferredOptions } from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useAsyncFn } from 'react-use';
import { trackOfflineAtc, trackOfflineAtcClick } from '@castlery/modules-tracking-services';
import { OfflineAddCartSource } from '@castlery/config';
import { addToCartCommandV2 } from '@castlery/modules-cart-services';
import { addToCartCommand } from '@castlery/modules-product-services';
import { logger } from '@castlery/observability';
import { AtcFulfillmentWarehouseTypeEnum, AtcFulfillmentMethod } from '@castlery/modules-cart-domain';
import { sharedFeatureService } from '@castlery/shared-services';

/**
 * @description
 * 1. 仅用于pos
 * @param param0
 * @returns
 */
export const ATCButton = ({ disabled, loading }: { disabled: boolean; loading: boolean }) => {
  const enableOrderV2 = sharedFeatureService.enabledOrderV2;
  const dispatch = useAppDispatch();
  // eslint-disable-next-line
  const [open, setOpen] = React.useState(false);

  const trackEvents = async () => {
    await dispatch(trackOfflineAtcClick());
    await dispatch(trackOfflineAtc());
  };

  const [{ loading: ATCLoading }, addToOrder] = useAsyncFn(async () => {
    try {
      if (enableOrderV2) {
        const fulfillmentWarehouseType = preferred_stock_location_id
          ? AtcFulfillmentWarehouseTypeEnum.Showroom
          : AtcFulfillmentWarehouseTypeEnum.Warehouse;
        const fulfillmentMethod = preferred_self_collection
          ? AtcFulfillmentMethod.CashAndCarry
          : AtcFulfillmentMethod.Delivery;
        await dispatch(
          addToCartCommandV2({
            scene: 'pdp-pos',
            source: OfflineAddCartSource.POS,
            fulfillmentMethod,
            fulfillmentWarehouseType,
          })
        ).unwrap();
      } else {
        await dispatch(addToCartCommand()).unwrap();
        await trackEvents();
      }
    } catch (error) {
      logger.error('Failed to add to cart', { error });
    }
  });
  const { preferred_stock_location_id, preferred_self_collection } = useAppSelector(selectPreferredOptions);

  const handleAddToCart = async () => {
    if (preferred_stock_location_id && !preferred_self_collection) {
      setOpen(true);
    } else {
      await addToOrder();
    }
  };
  return (
    <>
      <Button disabled={disabled} loading={loading || ATCLoading} fullWidth size="lg" onClick={handleAddToCart}>
        {!disabled ? 'Add To Cart' : 'Out of Stock'}
      </Button>
      <NiceModal
        title={'Do you confirm that this item will be fulfilled by delivery from Showroom?'}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={addToOrder}
      />
    </>
  );
};
