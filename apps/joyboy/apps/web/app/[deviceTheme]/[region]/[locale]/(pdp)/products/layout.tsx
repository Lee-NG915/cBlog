import { WebMainLayout } from '@castlery/modules-cms-components/server';
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { PDPClientLayout } from './layout.client';
interface PDPLayoutProps {
  children: React.ReactNode;
  params: {
    region: string;
    locale: string;
    slug: string;
  };
}

export default function PDPLayout({ children, params }: PDPLayoutProps) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.PDP} domain={BUSINESS_DOMAIN.PRODUCT}>
      <PDPClientLayout />
      <WebMainLayout needHideDYBanner={true}>{children}</WebMainLayout>
    </SentryContextProvider>
  );
}
