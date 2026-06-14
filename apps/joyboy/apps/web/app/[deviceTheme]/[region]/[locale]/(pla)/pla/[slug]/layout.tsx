import { WebMainLayout } from '@castlery/modules-cms-components/server';
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import { PlaLayoutClient } from './layout.client';

interface PLALayoutProps {
  children: React.ReactNode;
  params: {
    region: string;
    locale: string;
    slug: string;
  };
}

export default function PLALayout(props: PLALayoutProps) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.PDP} domain={BUSINESS_DOMAIN.PRODUCT}>
      <PlaLayoutClient />
      <WebMainLayout>{props.children}</WebMainLayout>
    </SentryContextProvider>
  );
}
