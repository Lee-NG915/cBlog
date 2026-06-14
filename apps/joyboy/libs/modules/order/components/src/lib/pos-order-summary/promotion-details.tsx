'use client';
import { Stack, Typography } from '@castlery/fortress';
import type { PromotionItem } from '@castlery/types';
import { toPrice } from '@castlery/utils';

export interface PromotionDetailsProps {
  promotions: PromotionItem[];
}
export function PromotionDetails({ promotions }: PromotionDetailsProps) {
  return (
    <Stack spacing={2}>
      <Typography level="h2" sx={{ textAlign: 'center' }}>
        Promotions Applied
      </Typography>
      {promotions?.map((promotion) => (
        <Stack key={promotion.name}>
          <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography level="subh2">{promotion.name}</Typography>
            <Typography level="subh2" sx={{ width: 60, flex: 'none', textAlign: 'right' }}>
              -{toPrice(Math.abs(Number(promotion.amount)))}
            </Typography>
          </Stack>
          <Typography level="caption1">{promotion.description}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export default PromotionDetails;
