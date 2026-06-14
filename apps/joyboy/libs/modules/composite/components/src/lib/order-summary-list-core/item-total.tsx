'use client';

import { SummaryRow } from './summary-row';
import { Typography } from '@castlery/fortress';

export interface ItemTotalProps {
  label: string;
  value: string;
  loading?: boolean;
  forcePadding?: boolean;
}
export function ItemTotal({ label, value, loading, forcePadding }: ItemTotalProps) {
  return (
    <SummaryRow loading={loading} forcePadding={forcePadding}>
      <Typography level="body2">{label}</Typography>
      <Typography level="body2">{value}</Typography>
    </SummaryRow>
  );
}
