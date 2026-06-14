import { WebMainLayout } from '@castlery/modules-cms-components/server';
import * as React from 'react';
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import AccountLayoutClient from './layout.client';

interface AccountLayoutProps {
  children: React.ReactNode;
  params: {
    deviceTheme: string;
    region: string;
    locale: string;
  };
}

// 账户模块布局 - 使用新的响应式侧边栏
export default function AccountLayout({ children, params }: AccountLayoutProps) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.ACCOUNT} domain={BUSINESS_DOMAIN.USER}>
      <WebMainLayout>
        <AccountLayoutClient>{children}</AccountLayoutClient>
        {/* <WebAccountLayout params={params}>{children}</WebAccountLayout> */}
      </WebMainLayout>
    </SentryContextProvider>
  );
}
