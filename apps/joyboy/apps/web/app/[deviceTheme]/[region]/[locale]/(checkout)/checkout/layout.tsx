import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { CheckoutLayoutClient } from './layout.client';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.CHECKOUT} domain={BUSINESS_DOMAIN.CHECKOUT}>
      <CheckoutLayoutClient>{children}</CheckoutLayoutClient>
    </SentryContextProvider>
  );
}
