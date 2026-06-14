'use client';
import { Box, Stack, Typography, Link } from '@castlery/fortress';
import { toPrice } from '@castlery/utils';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { EcEnv } from '@castlery/config';
import { campaignProgressBarLinkClickedEvent } from '@castlery/modules-promotion-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { ProgressBar } from './progress-bar';
import type { CampaignMessage, PriceBreakDiscount } from '../../hook/use-price-break-campaign';
import { accessInPos } from '@castlery/config';

interface PriceBreakHintProps {
  showFreeGiftUnlocked: boolean;
  campaign: CampaignMessage;
  currentDiscount: PriceBreakDiscount;
  itemTotal: number;
}

export function PriceBreakHint({ showFreeGiftUnlocked, campaign, currentDiscount, itemTotal }: PriceBreakHintProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_PROMOTION);
  const dispatch = useAppDispatch();
  const remainingAmount = Math.max(currentDiscount.limit - itemTotal, 0);
  const progressWidth = currentDiscount.limit > 0 ? (itemTotal / currentDiscount.limit) * 100 : 0;
  const safeProgressWidth = Number.isFinite(progressWidth) ? Math.min(Math.max(progressWidth, 0), 100) : 0;

  const handleLinkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!campaign.link) return;
    dispatch(
      campaignProgressBarLinkClickedEvent({
        campaignName: campaign.campaignName,
        discount: currentDiscount.label,
      })
    );
    const webUrl = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${campaign.link}`;
    window.open(webUrl, '_blank');
  };

  return (
    <Box>
      <Stack direction="row" flexWrap="wrap" alignItems="center">
        {showFreeGiftUnlocked && (
          <Typography level={accessInPos ? 'caption1' : 'body1'}>{t('promotionHint.freeGiftUnlocked')}</Typography>
        )}
        <Link component="button" level="body1" variant="primary" onClick={handleLinkClick}>
          {campaign.campaignName}:&nbsp;
        </Link>
        <Typography level={accessInPos ? 'caption1' : 'body1'}>
          {t('promotionHint.priceBreakProgress', {
            amount: toPrice(remainingAmount),
            label: currentDiscount.label,
          })}
        </Typography>
      </Stack>
      <ProgressBar label={currentDiscount.label} icon={currentDiscount.icon} width={safeProgressWidth} />
    </Box>
  );
}
