import { WebMainLayout } from '@castlery/modules-cms-components/server';
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.CART} domain={BUSINESS_DOMAIN.CART}>
      <WebMainLayout>{children}</WebMainLayout>
    </SentryContextProvider>
  );
}
