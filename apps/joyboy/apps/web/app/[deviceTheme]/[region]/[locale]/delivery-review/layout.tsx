import { WebMainLayout } from '@castlery/modules-cms-components/server';
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default function DeliveryReviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.OTHER} domain={BUSINESS_DOMAIN.ORDER}>
      <WebMainLayout>{children}</WebMainLayout>
    </SentryContextProvider>
  );
}
