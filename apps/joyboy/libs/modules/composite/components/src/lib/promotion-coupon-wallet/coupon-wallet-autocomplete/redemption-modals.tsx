'use client';

import { NiceModal } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

interface RedemptionActionModalProps {
  open: boolean;
  close: () => void;
  onConfirm: () => void;
}
export function RedemptionActionModal({ open, close, onConfirm }: RedemptionActionModalProps) {
  return (
    <NiceModal
      info
      title="This redemption cannot be undone."
      desc="The redemption of voucher cannot be undone. Would you like to proceed?"
      open={open}
      onClose={close}
      border={false}
      onCancel={close}
      onConfirm={onConfirm}
    />
  );
}

interface RemoveFreeGiftCouponConfirmModalProps {
  open: boolean;
  close: () => void;
  onConfirm: () => void | Promise<void>;
}

export function RemoveFreeGiftCouponConfirmModal({ open, close, onConfirm }: RemoveFreeGiftCouponConfirmModalProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION, { keyPrefix: 'removeFreeGiftCouponConfirm' });
  return (
    <NiceModal
      warning
      title={t('title')}
      desc={t('desc')}
      open={open}
      onClose={close}
      border={false}
      onCancel={close}
      onConfirm={onConfirm}
      confirmText={t('confirm')}
      cancelText={t('cancel')}
      isSilent={false}
    />
  );
}

interface CheckoutGiftCouponDisabledModalProps {
  open: boolean;
  close: () => void;
}

export function CheckoutGiftCouponDisabledModal({ open, close }: CheckoutGiftCouponDisabledModalProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION, { keyPrefix: 'checkoutGiftCouponDisabled' });
  return (
    <NiceModal
      info
      title={t('title')}
      desc={t('desc')}
      open={open}
      onClose={close}
      border={false}
      onConfirm={close}
      onCancel={close}
      confirmText={t('confirm')}
      showCancelBtn={false}
    />
  );
}
