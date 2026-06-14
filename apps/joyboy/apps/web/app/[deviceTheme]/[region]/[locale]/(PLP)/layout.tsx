import { WebMainLayout } from '@castlery/modules-cms-components/server';
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import PLPLayoutClient from './layout.client';

export default function PLPLayout({ children }: { children: React.ReactNode }) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.PLP} domain={BUSINESS_DOMAIN.SEARCH}>
      <WebMainLayout needHideDYBanner={true}>
        <PLPLayoutClient />
        {children}
      </WebMainLayout>
    </SentryContextProvider>
  );
}
