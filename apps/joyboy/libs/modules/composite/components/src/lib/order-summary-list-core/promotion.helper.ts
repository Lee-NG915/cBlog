import type { SummarySchema } from '@castlery/types';

export const hasFreeGiftPromotion = (summary?: SummarySchema) =>
  Boolean(
    summary?.promotionDetails?.promotions?.some((promotion) =>
      promotion.actions?.some((action) => action.actionType === 'ActionTypeFreeGift')
    )
  );
