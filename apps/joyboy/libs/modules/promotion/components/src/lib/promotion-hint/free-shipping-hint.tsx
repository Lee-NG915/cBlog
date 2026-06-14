'use client';
import { Box, Stack, Typography } from '@castlery/fortress';
import { toPrice } from '@castlery/utils';
import { useTranslation, Trans, LocalesNamespace } from '@castlery/monorepo-i18n';
import { ProgressBar } from './progress-bar';
import { accessInPos } from '@castlery/config';

interface FreeShippingHintProps {
  freeShippingComplete: boolean;
  showFreeGiftUnlocked: boolean;
  gap: number;
  limit: number;
  itemTotal: number;
}

export function FreeShippingHint({
  freeShippingComplete,
  showFreeGiftUnlocked,
  gap,
  limit,
  itemTotal,
}: FreeShippingHintProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION);

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1}>
        {showFreeGiftUnlocked && (
          <Typography level={accessInPos ? 'caption1' : 'body1'}>{t('promotionHint.freeGiftUnlocked')}</Typography>
        )}
        <Typography level={accessInPos ? 'caption1' : 'body1'}>
          {freeShippingComplete ? (
            <Trans t={t} i18nKey="promotionHint.freeShippingComplete" components={{ strong: <strong /> }} />
          ) : (
            <Trans
              t={t}
              i18nKey="promotionHint.freeShippingAway"
              values={{ amount: toPrice(gap) }}
              components={{ strong: <strong /> }}
            />
          )}
        </Typography>
      </Stack>
      <ProgressBar label="FREE!" icon="check-circle" width={freeShippingComplete ? 100 : (itemTotal / limit) * 100} />
    </Box>
  );
}
