'use client';
import React, { useCallback } from 'react';
import { Backdrop, Stack } from '@castlery/fortress';
import {
  PosOrderComment,
  PosExchangeOrder,
  PosPayment,
  PosShipments,
  AssemblyService,
  PosOrderCommentV1,
  PosExchangeOrderV1,
  PosShippingAddressSection,
  ShippingPreference,
} from '@castlery/modules-checkout-components';
import {
  selectCheckoutLoading,
  selectAddressLoading,
  selectPosCheckoutExchangeOrderChecked,
  selectPosCheckoutExchangeOrderNumber,
  selectPosCheckoutSubmitAttempted,
  setPosCheckoutExchangeOrderChecked,
  setPosCheckoutExchangeOrderNumber,
  setPosCheckoutOrderComment,
  setPosCheckoutSubmitAttempted,
} from '@castlery/modules-checkout-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { updateExchangeOrderNumber, updateOrderComment } from '@castlery/modules-checkout-services';
import { PosCheckoutAddress, PosCheckoutShippingMethod } from '@castlery/modules-composite-components';
import { useGetCheckoutInfoQuery, useGetCheckoutAddressListQuery } from '@castlery/modules-checkout-domain';
import { sharedFeatureService } from '@castlery/shared-services';

const enableOrderV2 = sharedFeatureService.enabledOrderV2;

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const checkLoading = useAppSelector(selectCheckoutLoading);
  const addressLoading = useAppSelector(selectAddressLoading);
  const exchangeOrderChecked = useAppSelector(selectPosCheckoutExchangeOrderChecked);
  const exchangeOrderNumber = useAppSelector(selectPosCheckoutExchangeOrderNumber);
  const submitAttempted = useAppSelector(selectPosCheckoutSubmitAttempted);
  // 1. 获取 checkout info
  // 2. 获取 checkout address list
  useGetCheckoutInfoQuery({ noCache: true, needsShippingMethod: true }, { refetchOnMountOrArgChange: true });
  useGetCheckoutAddressListQuery(undefined, { refetchOnMountOrArgChange: true });

  const onExchangeOrderChange = useCallback(
    (number: string) => {
      dispatch(setPosCheckoutSubmitAttempted(false));
      if (enableOrderV2) {
        dispatch(setPosCheckoutExchangeOrderNumber(number));
      } else {
        dispatch(updateExchangeOrderNumber(number));
      }
    },
    [dispatch]
  );
  const onExchangeOrderCheckChange = useCallback(
    (checked: boolean) => {
      dispatch(setPosCheckoutSubmitAttempted(false));
      dispatch(setPosCheckoutExchangeOrderChecked(checked));
      if (!checked) {
        dispatch(setPosCheckoutExchangeOrderNumber(''));
      }
    },
    [dispatch]
  );
  const onOrderCommentChange = useCallback(
    (comment: string) => {
      if (enableOrderV2) {
        dispatch(setPosCheckoutOrderComment(comment));
      } else {
        dispatch(updateOrderComment(comment));
      }
    },
    [dispatch]
  );

  return (
    <React.Fragment>
      <Backdrop open={checkLoading || addressLoading} />
      {enableOrderV2 ? (
        <Stack spacing={7} sx={{ padding: 4 }}>
          <PosShippingAddressSection />
          {/* =============================== shipments ================================ */}
          <PosCheckoutShippingMethod />
          {/* =============================== order comment ================================ */}
          <PosOrderCommentV1 name="orderComment" onChange={onOrderCommentChange} />
          <PosExchangeOrderV1
            name="exchangeOrderNumber"
            checked={exchangeOrderChecked}
            value={exchangeOrderNumber}
            showRequiredError={exchangeOrderChecked && submitAttempted && !exchangeOrderNumber.trim()}
            onCheckedChange={onExchangeOrderCheckChange}
            onChange={onExchangeOrderChange}
          />
        </Stack>
      ) : (
        <Stack spacing={2}>
          <PosCheckoutAddress />
          {/* =============================== shipments ================================ */}
          <PosShipments />
          {/* =============================== available assembly preferences ================================  */}
          <AssemblyService />
          {/* =============================== order comment ================================ */}
          <PosOrderComment name="orderComment" onChange={onOrderCommentChange} />
          <PosExchangeOrder name="exchangeOrderNumber" onChange={onExchangeOrderChange} />
          <PosPayment />
        </Stack>
      )}
    </React.Fragment>
  );
}
