'use client';
import React, { useCallback } from 'react';
import { Button, useNiceModal } from '@castlery/fortress';
import {
  clearPosCartCommand,
  selectPushToOnlineBtnStatus,
  transferCartItemsCommand,
} from '@castlery/modules-cart-services';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useRouter } from 'next/navigation';
import { posRoutes } from '@castlery/config';
import { selectCheckoutLoading } from '@castlery/modules-cart-domain';
import { POS_UMS_PERMISSIONS } from '@castlery/modules-user-services';
import { useHasPosUmsPermission } from '@castlery/shared-components';

export function PushToOnlineButton() {
  const dispatch = useAppDispatch();
  const pushToOnlineBtnStatus = useAppSelector(selectPushToOnlineBtnStatus);
  const checkoutLoading = useAppSelector(selectCheckoutLoading);
  const hasPushToOnlinePermission = useHasPosUmsPermission(POS_UMS_PERMISSIONS.posTransactionAccess);

  const [modal, contextHolder] = useNiceModal();
  const router = useRouter();
  const transfer = useCallback(async () => {
    return await dispatch(transferCartItemsCommand({ pushDestination: 'web' }));
  }, [dispatch]);

  const nextOrder = useCallback(async () => {
    await dispatch(clearPosCartCommand());
    return new Promise((resolve) => {
      router.replace(posRoutes.products);
      window.location.reload();
      setTimeout(resolve, 1500);
    });
  }, [dispatch, router]);

  const warning = {
    title: 'Do you want to push to online?',
    subDesc: 'Please check all information before proceeding.',
    confirmText: 'Confirm',
    onConfirm: transfer,
    showCloseBtn: false,
    isSilent: false,
    dialogSx: {
      textAlign: 'center',
    },
  };
  const errorParams = {
    danger: true,
    title: 'Error',
    subDesc: 'Failed to push to online. Please try again.',
    showCancelBtn: false,
    showCloseBtn: false,
    confirmText: 'Got it',
    isSilent: true,
    dialogSx: {
      textAlign: 'center',
    },
  };
  const successParams = {
    success: true,
    title: 'Success',
    subDesc: 'Order has been pushed to online!',
    showCancelBtn: false,
    confirmText: 'Next Order',
    isSilent: false,
    onConfirm: nextOrder,
    showCloseBtn: false,
    disabledCloseByClickBackdrop: true,
    dialogSx: {
      textAlign: 'center',
      h2: {
        justifyContent: 'center',
      },
    },
  };

  const handleClick = () => {
    const { then, reset } = modal.warning({ ...warning });
    then((res) => {
      if (res?.error || res?.payload?.error) {
        reset({ ...errorParams });
        return;
      }
      reset(successParams);
    });
  };

  return (
    <React.Fragment>
      <Button
        fullWidth
        variant="plain"
        color="warning"
        disabled={pushToOnlineBtnStatus?.disabled || checkoutLoading || !hasPushToOnlinePermission}
        onClick={handleClick}
      >
        Push to Online
      </Button>
      {contextHolder}
    </React.Fragment>
  );
}

export default PushToOnlineButton;
