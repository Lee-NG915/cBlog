import { WebMainLayout } from '@castlery/modules-cms-components/server';
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.BLOG} domain={BUSINESS_DOMAIN.CMS}>
      <WebMainLayout>{children}</WebMainLayout>
    </SentryContextProvider>
  );
}
