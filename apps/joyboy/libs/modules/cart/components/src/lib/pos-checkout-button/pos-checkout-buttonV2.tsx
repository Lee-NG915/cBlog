'use client';
import { Button, useNiceModal } from '@castlery/fortress';
import {
  checkoutRegistration,
  selectOrder,
  selectOrderLoading,
  getOrderByOrderNumber,
} from '@castlery/modules-order-domain';
import { selectCouponProcessingV2, selectFreeGiftBreakdown } from '@castlery/modules-promotion-domain';
import { CampaignInfoModal } from '@castlery/modules-promotion-components';
import {
  enterApp,
  getAddressesByUserId,
  selectedCustomerId,
  useGetAddressesByUserIdQuery,
} from '@castlery/modules-user-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { useRouter } from 'next/navigation';
import { posRoutes } from '@castlery/config';
import { selectCheckoutAddress } from '@castlery/modules-composite-services';
import { changeAddressByOrderNumber } from '@castlery/modules-checkout-domain';
import { trackOfflineCheckout } from '@castlery/modules-tracking-services';
import { selectCheckoutBtnStatus } from '@castlery/modules-order-services';

export const PosCheckoutButtonV2 = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [modal, modalContextHolder] = useNiceModal();

  const order = useAppSelector(selectOrder);
  const checkoutBtnStatus = useAppSelector(selectCheckoutBtnStatus);
  const orderLoading = useAppSelector(selectOrderLoading);
  const couponProcessing = useAppSelector(selectCouponProcessingV2);
  const customerId = useAppSelector(selectedCustomerId);
  const [showReminderModal, setOpenReminderModal] = useState(false);
  const [remindFlag, setRemindFlag] = useState(true);
  useGetAddressesByUserIdQuery(customerId as number, {
    skip: !customerId,
  });

  const { billingAddress, shippingAddress } = useAppSelector(selectCheckoutAddress);

  const { validCampaignGiftPromotion, orderCampaignGift } = useAppSelector(selectFreeGiftBreakdown);

  const checkBlockedItems = (items: any[] | undefined) => {
    return (
      Array.isArray(items) &&
      items?.some((item) => item.is_region_outdated || item.is_price_outdated || item.stock_state === 'OUT_OF_STOCK')
    );
  };
  const showModal = () => {
    modal.warning({
      title: 'Oops!',
      subDesc: 'Some items here cannot be checked out, please check your cart！',
      showCancelBtn: false,
      confirmText: 'Got it',
      dialogSx: {
        maxWidth: 400,
      },
    });
  };

  const checkCampaignGift = () => {
    if (validCampaignGiftPromotion && !orderCampaignGift) {
      return true;
    }
    return false;
  };

  const [{ loading }, handleCheckout] = useAsyncFn(async () => {
    const hasBlockedItems = checkBlockedItems(order?.line_items);
    const haveGiftPromotion = checkCampaignGift();
    if (haveGiftPromotion && remindFlag) {
      setOpenReminderModal(true);
      return;
    }

    if (hasBlockedItems || !order?.number) {
      showModal();
      return;
    }
    const res = await dispatch(checkoutRegistration.initiate(order.number));
    if ('error' in res) {
      return false;
    }

    const reCheck = checkBlockedItems(res.data?.line_items);
    if (reCheck) {
      showModal();
      await dispatch(getOrderByOrderNumber.initiate(order.number));
      return;
    }
    await dispatch(trackOfflineCheckout());
    await dispatch(getAddressesByUserId.initiate(customerId as number));

    if (billingAddress || shippingAddress) {
      await dispatch(
        changeAddressByOrderNumber.initiate({
          number: order.number,
          bill_address_attributes: billingAddress || shippingAddress,
          ship_address_attributes: shippingAddress || billingAddress,
        })
      );
    }

    await router.push(posRoutes.checkout);
    await dispatch(
      enterApp({
        page: 'checkout',
      })
    );
  }, [checkBlockedItems, order?.number, dispatch, router, showModal, customerId, billingAddress, shippingAddress]);
  useEffect(() => {
    if (!remindFlag) {
      handleCheckout();
      setRemindFlag(true);
    }
  }, [remindFlag, handleCheckout]);
  const buttonLoading = orderLoading || loading || couponProcessing;

  return (
    <>
      <Button fullWidth onClick={handleCheckout} loading={buttonLoading} disabled={checkoutBtnStatus.disabled}>
        Checkout
      </Button>
      {modalContextHolder}
      <CampaignInfoModal
        title="Don’t miss your free gift!"
        description="Are you sure you want to checkout without claiming your free gift?"
        open={showReminderModal}
        cancelText="Cancel"
        confirmText="Continue to checkout"
        onConfirm={() => {
          setRemindFlag(false);
          setOpenReminderModal(false);
        }}
        onClose={() => {
          setOpenReminderModal(false);
        }}
      />
    </>
  );
};

export default PosCheckoutButtonV2;
