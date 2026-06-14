'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectedRetailId, useGetStockLocationsByRetailIdQuery } from '@castlery/modules-retails-domain';
import { addGiftToCartCommand } from '@castlery/modules-cart-services';
import {
  AtcFulfillmentMethod,
  AtcFulfillmentWarehouseTypeEnum,
  usePosCheckInventoryMutation,
} from '@castlery/modules-cart-domain';
import { dt, EventsNames } from '@castlery/data-tracking-events';
import type { GiftPoolGiftItemWithVariantSchema } from '@castlery/types';
import { logger } from '@castlery/observability/client';
import { ChooseFreeGiftDeliveryModalBase } from './choose-free-gift-delivery-modal-base';

/**
 * Debounce only when the user changes Location (rapid Select changes).
 * Throttle would still emit on a fixed interval while values change — worse for “final selection” inventory.
 * First paint / stockLocations-only refresh stays immediate (no extra 300ms wait).
 */
const POS_GIFT_INVENTORY_DEBOUNCE_MS = 300;

function resolveGiftSku(gift: GiftPoolGiftItemWithVariantSchema): string | undefined {
  const top = gift as { sku?: string };
  if (top.sku) return top.sku;
  const detail = gift.variant;
  if (!detail) return undefined;
  return detail.variant?.sku ?? (detail as { sku?: string }).sku;
}

export interface PosChooseFreeGiftDeliveryModalV2Props {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  gift?: GiftPoolGiftItemWithVariantSchema | null;
  code?: string;
}

export const PosChooseFreeGiftDeliveryModalV2 = ({
  open,
  onClose,
  gift,
  code,
}: PosChooseFreeGiftDeliveryModalV2Props) => {
  const dispatch = useAppDispatch();
  const retailId = useAppSelector(selectedRetailId);

  const [loading, setLoading] = useState(false);
  const [deliveryMethodList, setDeliveryMethodList] = useState(['Delivery']);
  const [location, setLocation] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [inventoryState, setInventoryState] = useState<'IN_STOCK' | 'OUT_OF_STOCK' | 'UNAVAILABLE' | null>(null);
  const inventoryCheckSeq = useRef(0);
  const prevLocationForInventoryRef = useRef<string | undefined>(undefined);

  const [posCheckInventory, { isLoading: isCheckingInventory }] = usePosCheckInventoryMutation();

  const { currentData: stockLocations } = useGetStockLocationsByRetailIdQuery(retailId as number, {
    skip: !retailId,
  });

  useEffect(() => {
    if (!open || initialized) return;
    if (stockLocations && stockLocations.length > 0) {
      const firstLocation = stockLocations[0];
      const supportsSelfCollection = firstLocation?.support_self_collection;
      const methods = supportsSelfCollection ? ['Cash & Carry', 'Delivery'] : ['Delivery'];
      setDeliveryMethodList(methods);
      setLocation(firstLocation.id);
      setDeliveryMethod(methods.length === 1 ? methods[0] : null);
    } else {
      setLocation('Warehouse');
      setDeliveryMethod('Delivery');
      setDeliveryMethodList(['Delivery']);
    }
    setInitialized(true);
  }, [open, stockLocations, initialized]);

  useEffect(() => {
    if (!open) {
      setInitialized(false);
      setInventoryState(null);
      prevLocationForInventoryRef.current = undefined;
    }
  }, [open]);

  const runInventoryCheck = useCallback(
    async (locId: string) => {
      if (!open || !gift) return;
      const sku = resolveGiftSku(gift);
      if (!sku) {
        logger.error('POS gift inventory check skipped: no SKU on gift', { variantId: gift.variantId });
        setInventoryState('UNAVAILABLE');
        return;
      }
      const seq = ++inventoryCheckSeq.current;
      const currentLocation = stockLocations?.find((loc) => loc.id === locId);
      const stockLocationCode = locId === 'Warehouse' ? undefined : currentLocation?.code ?? currentLocation?.ims_code;
      try {
        const result = await posCheckInventory({
          sku,
          quantity: gift.quantity ?? 1,
          ...(stockLocationCode ? { stockLocationCode } : {}),
        }).unwrap();
        if (seq !== inventoryCheckSeq.current) return;
        setInventoryState(result.state);
      } catch (error) {
        if (seq !== inventoryCheckSeq.current) return;
        logger.error('POS gift inventory check failed', { error, variantId: gift.variantId, locId });
        setInventoryState('UNAVAILABLE');
      }
    },
    [open, gift, stockLocations, posCheckInventory]
  );

  const runInventoryCheckRef = useRef(runInventoryCheck);
  runInventoryCheckRef.current = runInventoryCheck;

  const debouncedLocationInventoryCheck = useMemo(
    () =>
      debounce((locId: string) => {
        void runInventoryCheckRef.current(locId);
      }, POS_GIFT_INVENTORY_DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    if (!open || !gift || !location) return;
    setInventoryState(null);

    const prev = prevLocationForInventoryRef.current;
    const locationChanged = prev !== undefined && prev !== location;
    prevLocationForInventoryRef.current = location;

    if (!locationChanged) {
      debouncedLocationInventoryCheck.cancel();
      void runInventoryCheck(location);
      return;
    }

    debouncedLocationInventoryCheck(location);

    return () => {
      debouncedLocationInventoryCheck.cancel();
    };
  }, [location, open, gift, stockLocations, runInventoryCheck, debouncedLocationInventoryCheck]);

  const giftAddToCart = useCallback(async () => {
    if (!gift) return;

    try {
      const tracker = dt.track(EventsNames.EVENT_GWP_ADD_TO_CART_CLICK);
      if (typeof tracker === 'function') {
        tracker({ giftId: gift.variantId });
      }
    } catch (error) {
      logger.error('Failed to track GWP add to cart event', { error, variantId: gift.variantId });
    }

    const giftPoolId = gift.freeGiftId ?? gift.giftPoolId;
    if (!giftPoolId) return;

    setLoading(true);
    try {
      const currentLocation = stockLocations?.find((loc) => loc.id === location);

      const result = await dispatch(
        addGiftToCartCommand({
          giftPoolId,
          coupon: code,
          quantity: gift.quantity,
          variantId: gift.variantId,
          salePrice: gift.variant.price,
          fulfillmentMethod:
            deliveryMethod === 'Cash & Carry' ? AtcFulfillmentMethod.CashAndCarry : AtcFulfillmentMethod.Delivery,
          fulfillmentWarehouse: currentLocation?.code
            ? AtcFulfillmentWarehouseTypeEnum.Showroom
            : AtcFulfillmentWarehouseTypeEnum.Warehouse,
        })
      );
      if (addGiftToCartCommand.fulfilled.match(result)) {
        onClose(false);
      }
    } catch (error) {
      logger.error('Failed to add gift to cart', { error, variantId: gift.variantId });
    } finally {
      setLoading(false);
    }
  }, [dispatch, gift, onClose, code, deliveryMethod, location, stockLocations]);

  const handleLocationChange = (value: string) => {
    if (!open) return;
    setLocation(value);
    if (stockLocations) {
      const stockLocation = stockLocations.find((loc) => loc.id === value);
      const methods = stockLocation?.support_self_collection ? ['Cash & Carry', 'Delivery'] : ['Delivery'];
      setDeliveryMethodList(methods);
      setDeliveryMethod(methods.length === 1 ? methods[0] : null);
    }
  };

  return (
    <ChooseFreeGiftDeliveryModalBase
      open={open}
      onDismiss={() => onClose(true)}
      onConfirm={giftAddToCart}
      locations={stockLocations}
      deliveryMethods={deliveryMethodList}
      location={location}
      onLocationChange={handleLocationChange}
      deliveryMethod={deliveryMethod}
      onDeliveryMethodChange={(value) => setDeliveryMethod(value)}
      loading={loading}
      inventoryChecking={isCheckingInventory}
      inStock={inventoryState === 'IN_STOCK'}
      confirmText={
        inventoryState === 'OUT_OF_STOCK'
          ? 'OUT_OF_STOCK'
          : inventoryState === 'UNAVAILABLE'
          ? 'UNAVAILABLE'
          : undefined
      }
    />
  );
};

export default PosChooseFreeGiftDeliveryModalV2;
