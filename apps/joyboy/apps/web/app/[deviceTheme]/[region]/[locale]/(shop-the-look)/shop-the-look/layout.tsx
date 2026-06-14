import { WebMainLayout } from '@castlery/modules-cms-components/server';
import React from 'react';
import { SentryContextProvider } from '@castlery/observability/client';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';
import ShopTheLookLayoutClient from './layout.client';
import { EcEnv } from '@castlery/config';
import { CMS_PATHS } from '@castlery/modules-cms-domain';
import { sbApiClient } from '@castlery/modules-cms-components';
import { ShopTheLookDataV2Storyblok } from '@castlery/types';

export default async function ShopTheLookLayout({ children }: { children: React.ReactNode }) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.CMS });
  const fullSlug = `${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/${CMS_PATHS.SHOP_THE_LOOK}`;

  const data = await sbApiClient.getSpecificPageWithoutCache(fullSlug);
  return (
    <SentryContextProvider pageType={PAGE_TYPES.OTHER} domain={BUSINESS_DOMAIN.CMS}>
      <WebMainLayout>
        {data?.content && (
          <ShopTheLookLayoutClient shopTheLookContent={data?.content as unknown as ShopTheLookDataV2Storyblok}>
            {children}
          </ShopTheLookLayoutClient>
        )}
      </WebMainLayout>
    </SentryContextProvider>
  );
}
