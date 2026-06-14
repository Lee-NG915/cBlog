'use client';

import { SummaryRow } from './summary-row';
import { Typography } from '@castlery/fortress';

export interface WarrantyTotalProps {
  label: string;
  value: string;
  loading?: boolean;
  forcePadding?: boolean;
}
export function WarrantyTotal({ label, value, loading, forcePadding }: WarrantyTotalProps) {
  return (
    <SummaryRow loading={loading} forcePadding={forcePadding}>
      <Typography level="body2">{label}</Typography>
      <Typography level="body2">{value}</Typography>
    </SummaryRow>
  );
}
