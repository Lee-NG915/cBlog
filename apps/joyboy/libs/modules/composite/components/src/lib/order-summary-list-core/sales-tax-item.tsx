'use client';

import { Typography } from '@castlery/fortress';
import { SummaryRow } from './summary-row';

export interface SalesTaxItemProps {
  label: string;
  value: string;
  loading?: boolean;
  forcePadding?: boolean;
}
export function SalesTaxItem({ label, value, loading, forcePadding }: SalesTaxItemProps) {
  return (
    <SummaryRow loading={loading} forcePadding={forcePadding}>
      <Typography level="body2">{label}</Typography>
      <Typography level="body2">{value}</Typography>
    </SummaryRow>
  );
}
