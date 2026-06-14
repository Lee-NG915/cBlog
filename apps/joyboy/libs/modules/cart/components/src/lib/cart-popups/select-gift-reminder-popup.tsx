'use client';
import { NiceModal } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

interface SelectGiftReminderPopupProps {
  open: boolean;
  onChooseGift: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export function SelectGiftReminderPopup({ open, onChooseGift, onSkip, onClose }: SelectGiftReminderPopupProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'webCheckoutButton' });

  return (
    <NiceModal
      open={open}
      onClose={onClose}
      warning
      title={t('selectGiftReminderTitle')}
      desc={t('selectGiftReminderDesc')}
      cancelText={t('selectGiftReminderSkip')}
      confirmText={t('selectGiftReminderChooseGift')}
      onCancel={onSkip}
      onConfirm={onChooseGift}
    />
  );
}
