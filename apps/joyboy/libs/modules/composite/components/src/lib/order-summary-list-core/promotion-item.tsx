'use client';
import { Chip } from '@castlery/fortress';
import { InfoThin } from '@castlery/fortress/Icons';
import { SummaryRow } from './summary-row';
import { ViewMoreDetailsAccordion, ViewMoreDetailsAccordionProps } from '@castlery/modules-cart-components';

export function PromotionItem({
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

export function PromotionInvalidItem({
  forcePadding,
  children,
}: {
  children: React.ReactNode | string;
  forcePadding?: boolean;
}) {
  return (
    <SummaryRow forcePadding={forcePadding}>
      <Chip
        variant="outlined"
        color="danger"
        startDecorator={
          <InfoThin
            color="danger"
            width={12}
            height={12}
            sx={{ color: (theme) => theme.palette.brand.rosewood[400] }}
          />
        }
        sx={{
          width: '100%',
          opacity: 0.5,
          textAlign: 'left',
        }}
      >
        {children}
      </Chip>
    </SummaryRow>
  );
}
