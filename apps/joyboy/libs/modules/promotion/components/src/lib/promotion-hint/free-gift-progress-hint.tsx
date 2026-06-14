'use client';
import { Typography } from '@castlery/fortress';
import { toPrice } from '@castlery/utils';
import { useTranslation, Trans, LocalesNamespace } from '@castlery/monorepo-i18n';
import { ProgressBar } from './progress-bar';

interface FreeGiftProgressHintProps {
  purchaseType: number;
  gap: number;
  limit: number;
  currentValue: number;
  desktop: boolean;
}

export function FreeGiftProgressHint({ purchaseType, gap, limit, currentValue, desktop }: FreeGiftProgressHintProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION);
  const formattedGap = purchaseType === 1 ? toPrice(gap) : String(gap);
  const i18nKey = desktop ? 'promotionHint.freeGiftProgressDesktop' : 'promotionHint.freeGiftProgressMobile';
  const progressWidth = limit > 0 ? (currentValue / limit) * 100 : 0;
  const safeProgressWidth = Number.isFinite(progressWidth) ? Math.min(Math.max(progressWidth, 0), 100) : 0;

  return (
    <>
      <Typography level="caption1">
        <Trans t={t} i18nKey={i18nKey} values={{ gap: formattedGap }} components={{ strong: <strong /> }} />
      </Typography>
      <ProgressBar width={safeProgressWidth} />
    </>
  );
}
