import { WebLayout } from '@castlery/shared-components';
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import AuthLayoutClient from './layout.client';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.ACCOUNT} domain={BUSINESS_DOMAIN.USER}>
      <AuthLayoutClient />
      <WebLayout>{children}</WebLayout>
    </SentryContextProvider>
  );
}
