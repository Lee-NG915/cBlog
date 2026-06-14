import * as React from 'react';
import {
  removeCartItem,
  selectAddToCartLoading,
  selectLineItemsAndServiceLineItems,
  selectRemoveItemLoading,
} from '@castlery/modules-cart-domain';
import { addToCartCommandV2 } from '@castlery/modules-cart-services';
import { selectOrderLineItems } from '@castlery/modules-order-domain';
import { removeItemCommand } from '@castlery/modules-order-services';
import { addToCartCommandByParams } from '@castlery/modules-product-services';
import { logger } from '@castlery/observability';
import { sharedFeatureService } from '@castlery/shared-services';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { OfflineAddCartSource } from '@castlery/config';
import { useAsyncFn } from 'react-use';

const enableOrderV2 = sharedFeatureService.enabledOrderV2;

type FreeSwatchVariant = {
  id: number;
  [key: string]: any;
};

export const useFreeSwatchCart = () => {
  const [swatchInProgress, setSwatchInProgress] = React.useState<number | undefined>();

  const orderLineItems = useAppSelector(selectOrderLineItems);
  const posCartItems = useAppSelector(selectLineItemsAndServiceLineItems);
  const addToCartLoadingV2 = useAppSelector(selectAddToCartLoading);
  const removeItemLoadingV2 = useAppSelector(selectRemoveItemLoading);
  const dispatch = useAppDispatch();

  const [{ loading: addToCartLoadingV1 }, addToCartCommand] = useAsyncFn(
    async (variantId: number) => {
      await dispatch(addToCartCommandByParams({ variant_id: variantId })).unwrap();
    },
    [dispatch]
  );

  React.useEffect(() => {
    if (!addToCartLoadingV1) {
      setSwatchInProgress(undefined);
    }
  }, [addToCartLoadingV1]);

  const isInCart = React.useCallback(
    (variantId: number) => {
      const lineItems = enableOrderV2 ? posCartItems : orderLineItems;
      return lineItems?.some((item) => item.variant.id === variantId) ?? false;
    },
    [orderLineItems, posCartItems]
  );

  const addSwatchToCart = React.useCallback(
    async (variant: FreeSwatchVariant) => {
      if (enableOrderV2) {
        if (addToCartLoadingV2) return;
        try {
          await dispatch(
            addToCartCommandV2({
              scene: 'swatch',
              source: OfflineAddCartSource.POS,
              variant,
            })
          );
        } catch (error) {
          logger.error('Failed to add swatch to cart', { error });
        }
        return;
      }

      setSwatchInProgress(variant.id);
      await addToCartCommand(variant.id);
    },
    [addToCartCommand, addToCartLoadingV2, dispatch]
  );

  const removeSwatchFromCart = React.useCallback(
    async (variantId: number) => {
      if (enableOrderV2) {
        if (removeItemLoadingV2) return;
        const targetItem = posCartItems?.find((item) => item.variant.id === variantId);
        if (!targetItem?.id) return;
        await dispatch(removeCartItem.initiate({ lineItemId: targetItem.id }));
        return;
      }

      orderLineItems?.forEach((item) => {
        if (item.variant.id === variantId) {
          dispatch(removeItemCommand(item.id));
        }
      });
    },
    [dispatch, orderLineItems, posCartItems, removeItemLoadingV2]
  );

  const getAddToCartButtonState = React.useCallback(
    (variantId: number) => ({
      loading: enableOrderV2 ? addToCartLoadingV2 : addToCartLoadingV1 && swatchInProgress === variantId,
      disabled: enableOrderV2 ? addToCartLoadingV2 : addToCartLoadingV1 && swatchInProgress !== variantId,
    }),
    [addToCartLoadingV1, addToCartLoadingV2, swatchInProgress]
  );

  const getRemoveFromCartButtonState = React.useCallback(
    () => ({
      loading: enableOrderV2 ? removeItemLoadingV2 : false,
      disabled: enableOrderV2 ? removeItemLoadingV2 : addToCartLoadingV1,
    }),
    [addToCartLoadingV1, removeItemLoadingV2]
  );

  return {
    isInCart,
    addSwatchToCart,
    removeSwatchFromCart,
    getAddToCartButtonState,
    getRemoveFromCartButtonState,
    canShowEmptyState: !addToCartLoadingV1,
  };
};
