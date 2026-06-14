'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  accordionClasses,
  Divider,
  accordionDetailsClasses,
  accordionSummaryClasses,
} from '@castlery/fortress';
import { PosProductItem } from '../pos-product-item/pos-product-item';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { PosEmptyCart } from '../empty-cart';
import { usePathname } from 'next/navigation';
import { PosItemActions } from '../pos-cart-actions/pos-item-actions/pos-item-actions';
import { PosItemDeliveryTip } from '../pos-item-delivery-tip/pos-item-delivery-tip';
import { STOCK_STATE } from '@castlery/utils';
import { DisabledOverlay } from '../disabled-overlay/disabled-overlay';
// import { trackOfflineAtcClick, trackOfflineAtc } from '@castlery/modules-tracking-services';
import type { AddOnServiceLineItemSchema, GiftLineItemSchema, LineItemSchema } from '@castlery/types';
import { ProductTypeMapping } from '@castlery/config';
import { loadGuardsmanCartPlansCommand } from '@castlery/modules-cart-services';
import { sharedFeatureService } from '@castlery/shared-services';
import { ChangeGiftButton } from '../cart-item-info/line-item-base-info';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ChooseGiftGallery } from '@castlery/modules-promotion-components';

export type PosCartItem = LineItemSchema | AddOnServiceLineItemSchema | GiftLineItemSchema;

export function PosCartItems({ lineItems }: { lineItems: PosCartItem[] }) {
  const dispatch = useAppDispatch();
  const clickDisabled = usePathname().includes('/checkout');
  const hasItems = lineItems.length > 0;
  const [activeItemId, setActiveItemId] = useState<string | undefined>();
  const [changingGiftItem, setChangingGiftItem] = useState<GiftLineItemSchema | undefined>();
  const guardsmanCartLookupKey = useMemo(
    () =>
      lineItems
        .filter(
          (item) =>
            item.productType !== ProductTypeMapping.SERVICE &&
            item.productType !== ProductTypeMapping.SWATCH &&
            Boolean(item.variant?.sku)
        )
        .map((item) => `${item.id}:${item.variant?.sku}:${item.salePrice || item.cartSalePrice || item.variant?.price}`)
        .join('|'),
    [lineItems]
  );

  // [保险接入] POS Cart 行变化时预加载 Guardsman plans（CA），与 Web Cart/MiniCart 逻辑一致
  useEffect(() => {
    if (!sharedFeatureService.isGuardsmanEnabled() || !hasItems || !guardsmanCartLookupKey) {
      return;
    }

    void dispatch(loadGuardsmanCartPlansCommand());
  }, [dispatch, guardsmanCartLookupKey, hasItems]);

  //   const trackAtc = async () => {
  //     await dispatch(trackOfflineAtcClick());
  //     await dispatch(trackOfflineAtc());
  //   };

  const accordionChange = (event: React.SyntheticEvent, expanded: boolean, id: string) => {
    const activeId = expanded ? id : undefined;
    setActiveItemId(activeId);
  };
  const isOutDated = (item: PosCartItem) =>
    item.isRegionOutdated || item.isPriceOutdated || item.stockStatus === STOCK_STATE.OUT_OF_STOCK;

  return (
    <React.Fragment>
      {hasItems ? (
        <AccordionGroup
          disableDivider
          sx={{
            [`& .${accordionClasses.root}.${accordionClasses.expanded}`]: {
              // borderLeft: (theme) => `3px solid ${theme.palette.brand.terracotta[500]}`,
              backgroundColor: 'var(--fortress-palette-brand-warmLinen-400)',
            },
          }}
        >
          {lineItems.map((item, index) => {
            const isActive = activeItemId === item.id;
            // const isLast = index === lineItems.length - 1;
            const isGiftItem = ('isGift' in item && item.isGift) || ('giftPoolId' in item && !!item.giftPoolId);
            const showWarrantyItem =
              item.productType !== ProductTypeMapping.SERVICE &&
              item.productType !== ProductTypeMapping.SWATCH &&
              !isGiftItem;

            return (
              <React.Fragment key={item.id}>
                <Accordion
                  disabled={clickDisabled}
                  expanded={isActive}
                  sx={{
                    px: 2,
                    py: 3,
                    '.Mui-disabled': {
                      border: 'none',
                    },
                  }}
                  onChange={(event, expanded) => accordionChange(event, expanded, item.id)}
                >
                  <AccordionSummary
                    indicator={null}
                    sx={{
                      p: 0,
                      m: 0,
                      [`.${accordionSummaryClasses.button}`]: {
                        p: 0,
                        m: 0,
                        paddingInline: 0,
                        marginInline: 0,
                      },
                    }}
                  >
                    <PosProductItem item={item} activeStatus={isActive} showWarrantyItem={showWarrantyItem} />
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      [`&>.${accordionDetailsClasses.content}`]: {
                        py: 0,
                      },
                      [`& .${accordionDetailsClasses.content}.${accordionDetailsClasses.expanded}`]: {
                        py: 0,
                      },
                    }}
                  >
                    {/* {isOutDated(item) && <DisabledOverlay />} */}
                    <PosItemDeliveryTip item={item} />
                    {!isGiftItem && !isOutDated(item) && (
                      <PosItemActions item={item} showWarrantyItem={showWarrantyItem} />
                    )}
                    {isGiftItem && (
                      <ChangeGiftButton
                        onChangeGift={() => setChangingGiftItem(item as unknown as GiftLineItemSchema)}
                      />
                    )}
                  </AccordionDetails>
                </Accordion>
                {/* {!isLast && <Divider sx={{ marginX: 2 }} />} */}
              </React.Fragment>
            );
          })}
        </AccordionGroup>
      ) : (
        <PosEmptyCart />
      )}
      {changingGiftItem && (
        <ChooseGiftGallery
          sourceType={changingGiftItem.coupon ? 'coupon' : 'campaign'}
          coupon={changingGiftItem.coupon}
          actionType="change"
          initialOpen={true}
          lineItemId={changingGiftItem.id}
          onClose={() => setChangingGiftItem(undefined)}
        />
      )}
    </React.Fragment>
  );
}

export default PosCartItems;
