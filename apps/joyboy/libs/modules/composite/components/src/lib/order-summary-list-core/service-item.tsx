'use client';

import { SummaryRow } from './summary-row';
import { ViewMoreDetailsAccordion, ViewMoreDetailsAccordionProps } from '@castlery/modules-cart-components';

export function ServiceItem({
  loading,
  forcePadding,
  ...props
}: ViewMoreDetailsAccordionProps & { loading?: boolean; forcePadding?: boolean }) {
  return (
    <SummaryRow loading={loading} forcePadding={forcePadding}>
      <ViewMoreDetailsAccordion {...props} />
    </SummaryRow>
  );
}
