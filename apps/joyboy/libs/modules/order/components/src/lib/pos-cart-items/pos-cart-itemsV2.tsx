'use client';
import React, { useState } from 'react';
import {
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  accordionClasses,
  Divider,
  buttonClasses,
  accordionDetailsClasses,
} from '@castlery/fortress';
import { PosFreeProductItem } from '../cart-line-item/pos-free-gift-item/pos-free-product-item';
import { PosProductItem } from '../cart-line-item/pos-product-item/pos-product-item';
import { PosWarrantyItem } from '../cart-line-item/pos-warranty-item/pos-warranty-item';
import { PosItemDeliveryTip } from '../cart-line-item/pos-item-delivery-tip/pos-item-delivery-tip';
import { DisabledMasker } from '../disabled-masker/disabled-masker';
import { PosProductItemControl } from '../cart-line-item/pos-product-item-control/pos-product-item-control';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { selectCartItems, type AdjustPriceApiPayload } from '@castlery/modules-order-domain';
import { CartEmpty } from '../pos-site-cart/cart-empty';
import { changeQuantityCommand, removeItemCommand, adjustPriceCommand } from '@castlery/modules-order-services';
import type { PosQtyType } from '../pos-qty-editor/pos-qty-editor';
import { usePathname } from 'next/navigation';
import { PosFreeGiftControl } from '../cart-line-item/pos-free-gift-control/pos-free-gift-control';
import { STOCK_STATE } from '@castlery/utils';
import { trackOfflineAtcClick, trackOfflineAtc } from '@castlery/modules-tracking-services';
import type { LineItem, AddonServiceLineItem } from '@castlery/modules-order-domain';
import { PosPromotionHint } from '@castlery/modules-promotion-components';

export function PosCartItemsV2() {
  const clickDisabled = usePathname().includes('/checkout');

  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const hasItems = cartItems.length > 0;
  const [activeItemId, setActiveItemId] = useState<number | undefined>();

  const trackAtc = async () => {
    await dispatch(trackOfflineAtcClick());
    await dispatch(trackOfflineAtc());
  };

  const changeQty = async (type: PosQtyType, itemId: number): Promise<void> => {
    await dispatch(changeQuantityCommand({ type, itemId }));
    await trackAtc();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });
  };
  const removeItem = async (itemId: number) => {
    await dispatch(removeItemCommand(itemId));
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });
  };

  const setDiscount = async (payload: Omit<AdjustPriceApiPayload, 'orderNumber'>) => {
    await dispatch(adjustPriceCommand({ ...payload }));
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });
  };

  const accordionChange = (event: React.SyntheticEvent, expanded: boolean, id: number) => {
    const activeId = expanded ? id : undefined;
    setActiveItemId(activeId);
  };
  const activeStatus = (id: number) => activeItemId === id;
  const isOutDated = (item: any) => {
    return item.is_region_outdated || item.is_price_outdated || item.stock_state === STOCK_STATE.OUT_OF_STOCK;
  };

  return (
    <React.Fragment>
      {hasItems ? (
        <>
          {!clickDisabled && <PosPromotionHint />}

          <AccordionGroup
            disableDivider
            sx={{
              [`& .${accordionClasses.root}.${accordionClasses.expanded}`]: {
                borderLeft: (theme) => `3px solid ${theme.palette.brand.terracotta[500]}`,
              },
            }}
          >
            {cartItems.map((item: any, index) => (
              <>
                <Accordion
                  key={index}
                  disabled={clickDisabled}
                  expanded={activeStatus(item.id) || ((item?.is_gift || !!item?.gift_id) && isOutDated(item))}
                  sx={{
                    paddingX: 2,
                    paddingY: 1,
                    '.Mui-disabled': {
                      border: 'none',
                    },
                  }}
                  onChange={(event, expanded) => {
                    accordionChange(event, expanded, item.id);
                  }}
                >
                  {/* FreeGift Item */}
                  {(item as LineItem).is_gift || !!(item as LineItem).gift_id ? (
                    <>
                      <AccordionSummary
                        indicator={null}
                        sx={{
                          [`&>.${buttonClasses.root}`]: {
                            p: 0,
                            m: 0,
                          },
                        }}
                      >
                        <PosFreeProductItem
                          item={item as Partial<LineItem & AddonServiceLineItem>}
                          activeStatus={activeStatus(item.id)}
                          removeItem={removeItem}
                          isExpanded={activeItemId === item.id}
                        />
                      </AccordionSummary>
                      <AccordionDetails
                        sx={{
                          [`&>.${accordionDetailsClasses.content}`]: {
                            paddingY: 0,
                          },
                        }}
                      >
                        {isOutDated(item) && <DisabledMasker />}
                        <PosFreeGiftControl
                          item={item as Partial<LineItem & AddonServiceLineItem>}
                          isOutDated={isOutDated(item)}
                        />
                      </AccordionDetails>
                    </>
                  ) : (
                    <>
                      <AccordionSummary
                        indicator={null}
                        sx={{
                          [`&>.${buttonClasses.root}`]: {
                            p: 0,
                            m: 0,
                          },
                        }}
                      >
                        <PosProductItem
                          item={item as Partial<LineItem & AddonServiceLineItem>}
                          activeStatus={activeStatus(item.id)}
                          removeItem={removeItem}
                        />
                      </AccordionSummary>
                      <AccordionDetails
                        sx={{
                          [`&>.${accordionDetailsClasses.content}`]: {
                            paddingY: 0,
                          },
                        }}
                      >
                        {isOutDated(item) && <DisabledMasker />}
                        <PosProductItemControl
                          item={item as Partial<LineItem & AddonServiceLineItem>}
                          changeQty={changeQty}
                          setDiscount={setDiscount}
                        />
                        <PosWarrantyItem item={item as Partial<LineItem & AddonServiceLineItem>} />
                        <PosItemDeliveryTip item={item as Partial<LineItem & AddonServiceLineItem>} />
                      </AccordionDetails>
                    </>
                  )}
                </Accordion>
                {index < cartItems.length - 1 && <Divider sx={{ marginX: 2 }} />}
              </>
            ))}
          </AccordionGroup>
        </>
      ) : (
        <CartEmpty />
      )}
    </React.Fragment>
  );
}

export default PosCartItemsV2;
