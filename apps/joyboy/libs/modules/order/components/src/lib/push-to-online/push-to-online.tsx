'use client';
import React, { useCallback } from 'react';
import { Button, useNiceModal } from '@castlery/fortress';
import { selectPushToOnlineBtnStatus } from '@castlery/modules-order-services';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { transferItemsCommand, createANewPosOrder } from '@castlery/modules-order-services';
import { useRouter } from 'next/navigation';
import { posRoutes } from '@castlery/config';

export function PushToOnline() {
  const dispatch = useAppDispatch();
  const pushToOnlineBtnStatus = useAppSelector(selectPushToOnlineBtnStatus);
  const [modal, contextHolder] = useNiceModal();
  const router = useRouter();

  const transfer = useCallback(async () => {
    return dispatch(transferItemsCommand({ to: 'web' })).then(async () => {
      await dispatch(createANewPosOrder());
    });
  }, [dispatch]);

  const nextOrder = useCallback(async () => {
    return new Promise((resolve) => {
      router.replace(posRoutes.products);
      window.location.reload();
      setTimeout(resolve, 1000);
    });
  }, [router]);

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
      // console.log('-----res', res);
      if (res?.payload?.error) {
        reset({ ...errorParams });
        return;
      }
      reset(successParams);
    });
  };

  return (
    <React.Fragment>
      <Button fullWidth variant="secondary" disabled={pushToOnlineBtnStatus.disabled} onClick={handleClick}>
        Push to Online
      </Button>
      {contextHolder}
    </React.Fragment>
  );
}

export default PushToOnline;
