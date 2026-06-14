'use client';
import { Stack, Link, CircularProgress } from '@castlery/fortress';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { initMulberry, formatWarrantyOfferPayload_V2 } from '@castlery/utils';
import { accessInPos, openGuardsmanWidget } from '@castlery/config';
import {
  selectCartLineItems,
  useAddWarrantyMutation,
  selectWarrantyLoading,
  selectCartGiftItems,
  selectGuardsmanCartItems,
} from '@castlery/modules-cart-domain';
import { loadGuardsmanCartPlansCommand } from '@castlery/modules-cart-services';
import { LineItemSchema } from '@castlery/types';
import { useState, useRef } from 'react';
import { sharedFeatureService } from '@castlery/shared-services';
import { logger } from '@castlery/observability';

/**
 * [保险接入] Cart/MiniCart 行内「Add extended warranty」
 * - Guardsman (CA): 依赖 loadGuardsmanCartPlansCommand 预加载 → openGuardsmanWidget → POST /cart/warranty
 * - Mulberry (US): initMulberry modal → POST /cart/warranty（warrantyOfferId）
 * - PDP 加车时已带保险的 line 只展示 Remove，不会渲染此按钮
 */
interface WarrantyInlineButtonProps {
  targetLineItemId: LineItemSchema['id'];
}
export function WarrantyInlineButton({ targetLineItemId }: WarrantyInlineButtonProps) {
  const dispatch = useAppDispatch();
  const warrantyProvider = sharedFeatureService.getWarrantyProvider();
  const cartLineItems = useAppSelector(selectCartLineItems);
  const cartGiftsItems = useAppSelector(selectCartGiftItems);
  const warrantyLoading = useAppSelector(selectWarrantyLoading);
  const guardsmanCartItems = useAppSelector(selectGuardsmanCartItems);

  const [addWarranty] = useAddWarrantyMutation();

  const [modalProcessing, setModalProcessing] = useState(false);
  const [actionSymbol, setActionSymbol] = useState<LineItemSchema['id']>();
  const modalRef = useRef<{ close: () => void } | null>(null);
  const guardsmanModalOpenRef = useRef(false);

  const allCartItems = [...cartLineItems, ...cartGiftsItems];
  const targetLineItem = allCartItems.find((item) => item.id === targetLineItemId);
  const targetGuardsmanCartItem = guardsmanCartItems[targetLineItemId];

  const handleOpenWarrantyModal = async () => {
    const warrantyPayload = targetLineItem ? formatWarrantyOfferPayload_V2(targetLineItem) : null;
    if (!warrantyPayload) return;
    setModalProcessing(true);
    try {
      await initMulberry({
        payload: warrantyPayload as any,
        onSelect: async (warranty) => {
          // console.log(warranty);
          setActionSymbol(targetLineItemId);
          const offerId = warranty?.warranty_offer_id;
          const res = await addWarranty({
            cartItemId: targetLineItemId,
            ...(warrantyProvider === 'guardsman' && offerId
              ? {
                  warranty: {
                    vendor: 'guardsman' as const,
                    offerId,
                  },
                }
              : {}),
            ...(warrantyProvider === 'mulberry' && offerId
              ? {
                  warrantyOfferId: offerId,
                }
              : {}),
          });
          if (res?.data && 'code' in res.data && res.data.code === 0) {
            modalRef?.current?.close();
            return Promise.resolve();
          } else {
            return Promise.reject('Failed to add warranty');
          }
        },
        onSuccess: async (modal: any) => {
          setModalProcessing(false);
          modalRef.current = modal;
          modal.open();
        },
      });
      setModalProcessing(false);
    } catch (err) {
      logger.error('Failed to add warranty', { error: err });
    }
  };
  const isGuardsmanEnabled = sharedFeatureService.isGuardsmanEnabled();
  const isMulberryEnabled = sharedFeatureService.isMulberryEnabled();
  if (isGuardsmanEnabled) {
    const hasGuardsmanPlans = Boolean(targetGuardsmanCartItem?.isEligible && targetGuardsmanCartItem?.plans?.length);
    const productId = targetGuardsmanCartItem?.requestedProductId || targetLineItem?.variant?.sku;
    const price = Number(
      targetGuardsmanCartItem?.requestedPrice ||
        targetLineItem?.salePrice ||
        targetLineItem?.variant?.price ||
        targetLineItem?.cartSalePrice ||
        0
    );

    if (!hasGuardsmanPlans || !productId) {
      return null;
    }

    const handleOpenGuardsmanModal = async () => {
      if (modalProcessing || guardsmanModalOpenRef.current) {
        return;
      }

      setModalProcessing(true);
      guardsmanModalOpenRef.current = true;
      try {
        const openPromise = openGuardsmanWidget({
          productId,
          price,
          onOpen: () => {
            setModalProcessing(false);
          },
        });
        const result = await openPromise;

        if (result?.added && result.plan?.offerId) {
          setActionSymbol(targetLineItemId);
          await addWarranty({
            cartItemId: targetLineItemId,
            ...(warrantyProvider === 'guardsman'
              ? {
                  warranty: {
                    vendor: 'guardsman' as const,
                    offerId: result.plan.offerId,
                  },
                }
              : {}),
            ...(warrantyProvider === 'mulberry'
              ? {
                  warrantyOfferId: result.plan.offerId,
                }
              : {}),
          });
          await dispatch(loadGuardsmanCartPlansCommand());
        }
      } catch (err) {
        logger.error('Failed to open Guardsman widget', { error: err });
      } finally {
        guardsmanModalOpenRef.current = false;
        setModalProcessing(false);
      }
    };

    const isLoading = modalProcessing || (warrantyLoading && actionSymbol === targetLineItemId);
    return (
      <Stack alignItems="flex-start">
        <Link
          variant="primary"
          level="caption1"
          component="button"
          underline="always"
          aria-disabled={isLoading}
          sx={{
            pointerEvents: isLoading ? 'none' : undefined,
            ...(accessInPos
              ? {
                  color: 'var(--fortress-palette-brand-mono-700)',
                  fontSize: '12px',
                  height: 'fit-content',
                  textDecorationColor: 'var(--fortress-palette-brand-mono-700)',
                }
              : {}),
          }}
          onClick={handleOpenGuardsmanModal}
        >
          {accessInPos ? 'Add warranty' : 'Add extended warranty'}{' '}
          {isLoading && <CircularProgress size={'sm'} sx={{ ml: 0.5 }} />}
        </Link>
      </Stack>
    );
  }
  if (!isMulberryEnabled) {
    return null;
  }
  const isLoading = modalProcessing || (warrantyLoading && actionSymbol === targetLineItemId);
  return (
    <Stack alignItems="flex-start">
      <Link variant="primary" level="caption1" component="button" underline="always" onClick={handleOpenWarrantyModal}>
        Add extended warranty {isLoading && <CircularProgress size={'sm'} sx={{ ml: 0.5 }} />}
      </Link>
    </Stack>
  );
}

export default WarrantyInlineButton;
