import { WebMainLayout } from '@castlery/modules-cms-components/server';
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import ReferralLayoutClient from './layout.client';

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.OTHER} domain={BUSINESS_DOMAIN.USER}>
      <WebMainLayout>
        <ReferralLayoutClient>{children}</ReferralLayoutClient>
      </WebMainLayout>
    </SentryContextProvider>
  );
}
