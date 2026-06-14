'use client';

import { NiceModal } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

interface GiftRemoveConfirmPopupProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function GiftRemoveConfirmPopup({ open, onClose, onConfirm }: GiftRemoveConfirmPopupProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION, { keyPrefix: 'giftRemoveConfirm' });
  return (
    <NiceModal
      warning
      open={open}
      onClose={onClose}
      title={t('title')}
      desc={t('desc')}
      onCancel={onClose}
      onConfirm={onConfirm}
      cancelText={t('cancel')}
      confirmText={t('confirm')}
      border={false}
    />
  );
}

export default GiftRemoveConfirmPopup;
