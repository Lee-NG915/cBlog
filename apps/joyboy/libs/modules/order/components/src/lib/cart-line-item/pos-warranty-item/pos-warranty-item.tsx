'use client';
import { Stack, Typography } from '@castlery/fortress';
import { PosAddWarrantyButton } from '../../pos-add-warranty/pos-add-warranty';
import { LineItem, AddonServiceLineItem } from '@castlery/types';
import { toPrice } from '@castlery/utils';
import { EcEnv, enableWarranty } from '@castlery/config';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { formatWarrantyOfferPayload, initMulberry } from '@castlery/utils';
import { changeWarrantyItemQuantity } from './helper';

const __MULBERRY_PUBLIC_TOKEN__ = EcEnv.NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN || '';
export interface PosWarrantyItemProps {
  item: Partial<LineItem & AddonServiceLineItem>;
}

export function PosWarrantyItem({ item }: PosWarrantyItemProps) {
  const dispatch = useAppDispatch();
  const [hasOffers, setHasOffers] = useState(false);
  const mulberryModalRef = useRef(null);

  const { warranty_items = null, id, quantity, product_type = '' } = item;
  const { duration_months, warranty_offer_cost } = warranty_items || {};

  const mulberryPayload = useMemo(() => {
    if (!enableWarranty) return null;
    const { variant, product_type, bundle_line_items } = item;
    if (!variant || !product_type) return null;
    return formatWarrantyOfferPayload({ variant, product_type, bundle_line_items });
  }, [item]);

  const showWarranty =
    enableWarranty && !['service', 'swatch'].includes(product_type) && mulberryPayload && !!__MULBERRY_PUBLIC_TOKEN__;

  useEffect(() => {
    const addWarranty = async (warranty: any) => {
      const { warranty_offer_id } = warranty;
      if (!warranty_offer_id || !id) return;
      return dispatch(
        changeWarrantyItemQuantity({ lineItemId: id, quantity: quantity || 1, warrantyId: warranty_offer_id })
      ).then(() => {
        mulberryModalRef?.current?.close();
      });
    };

    if (showWarranty) {
      initMulberry({
        payload: mulberryPayload,
        onSelect: addWarranty,
        onSuccess: (modal) => {
          mulberryModalRef.current = modal;
          setHasOffers(true);
        },
      });
    }
  }, [mulberryPayload, showWarranty, mulberryModalRef, setHasOffers, id, quantity, dispatch]);

  const openModal = () => {
    mulberryModalRef?.current?.open();
  };
  const remove = async () => {
    if (!id) return;
    await dispatch(changeWarrantyItemQuantity({ lineItemId: id, quantity: quantity || 1 }));
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  if (!showWarranty || !hasOffers) return null;

  return (
    <>
      {warranty_items ? (
        <Stack sx={{ display: 'grid', gridTemplateColumns: 'auto 60px' }}>
          <Typography level="caption1">Extended Warranty: {duration_months} Months</Typography>
          <Typography level="caption1" sx={{ textAlign: 'right' }}>
            {toPrice(Number(warranty_offer_cost), true)}
          </Typography>
        </Stack>
      ) : null}
      <PosAddWarrantyButton warrantyItem={warranty_items} add={openModal} remove={remove} />
    </>
  );
}

export default PosWarrantyItem;
