'use client';
import * as React from 'react';
import type { PropsWithChildren } from 'react';
import { StoreProvider } from '../../lib/providers';
import { Unsubscribe } from '@reduxjs/toolkit';
import { startAppListening } from '@castlery/shared-redux-store';
import { notFound, redirect } from 'next/navigation';
import { setupOrderListeners } from '@castlery/modules-order-services';
import { setupRetailsListeners } from '@castlery/modules-retails-services';
import { setupCheckoutListeners } from '@castlery/modules-checkout-services';
import { setupCartListeners } from '@castlery/modules-cart-services';
import { setupPromotionListeners } from '@castlery/modules-promotion-services';
import { ThemeProvider, useApiErrorModal, WarrantyProviderManager } from '@castlery/shared-components';
import { PosUmsPermissionBootstrap } from '@castlery/modules-user-components';
import { aime, minervaModern, poppins, sanomatSans } from '@castlery/shared-next-font';
import { setupUserListeners } from '@castlery/modules-user-services';
import { setupProductListeners } from '@castlery/modules-product-services';
import { EcEnv, locales, enableWarranty } from '@castlery/config';
import { setupApiErrorListeners, setupCompositesListeners } from '@castlery/modules-composite-services';
import { useNiceModal, BreakpointProvider } from '@castlery/fortress';
import { dt } from '@castlery/data-tracking-events';
import { GTMTagsManager, GTMNoScripts, PosUttInitialScript } from '@castlery/modules-tracking-components';
import { setupOrderTrackingListeners } from '@castlery/modules-tracking-services';
import { fallbackLocale } from '@castlery/monorepo-i18n';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { sharedFeatureService } from '@castlery/shared-services';

type LocaleLayoutParams = {
  params: {
    locale: string;
  };
};

/**
 * LocaleLayoutProperties extends from PropsWithChildren, a utility type
 * that automatically infers and includes the 'children' prop, making it
 * suitable for components that expect to receive children elements.
 * @see https://next-intl-docs.vercel.app/docs/environments/server-client-components
 */
type LocaleLayoutProperties = PropsWithChildren<LocaleLayoutParams>;
const POS_LISTENERS_READY_EVENT = 'pos:listeners-ready';

export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProperties) {
  if (!locales.map(({ value }) => value).includes(locale)) notFound();
  if (locale !== EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()) {
    redirect(`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`);
  }
  // POS不支持切换语言，默认语言就是当前语言，后续扩展切换语言功能时，此处需要动态获取当前语言
  if (fallbackLocale) {
    makePersistenceHandles().preferredLanguage.setItem(fallbackLocale);
  }
  const [modal, contextHolder] = useNiceModal();
  const enableOrderV2 = sharedFeatureService.enabledOrderV2;
  const isGuardsmanEnabled = sharedFeatureService.isGuardsmanEnabled();
  const [apiModal, apiModalContextHolder] = useApiErrorModal();
  React.useEffect(() => {
    const subscriptions: Unsubscribe[] = [
      setupUserListeners(startAppListening, { modal }),
      setupRetailsListeners(startAppListening),
      setupProductListeners(startAppListening),
      setupCheckoutListeners(startAppListening, { modal, dt }),
      setupCompositesListeners(startAppListening, { modal }),
      setupPromotionListeners(startAppListening),
      ...(enableOrderV2 ? [setupCartListeners(startAppListening)] : [setupOrderListeners(startAppListening)]),
      setupApiErrorListeners(startAppListening, { apiModal }),
      setupOrderTrackingListeners(startAppListening),
    ];
    // 标记监听器就绪，供子布局安全触发 enterApp 等启动事件
    (typeof window !== 'undefined'
      ? window
      : (globalThis as Window & { __HAS_POS_LISTENERS_READY__?: boolean })
    ).__HAS_POS_LISTENERS_READY__ = true;
    window.dispatchEvent(new CustomEvent(POS_LISTENERS_READY_EVENT));

    return () => {
      (typeof window !== 'undefined'
        ? window
        : (globalThis as Window & { __HAS_POS_LISTENERS_READY__?: boolean })
      ).__HAS_POS_LISTENERS_READY__ = false;
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // React.useEffect(() => {
  //   // client 端加载 lazysizes 插件，用于 fortress 图片懒加载
  //   if (typeof window !== 'undefined') {
  //     import('lazysizes/plugins/rias/ls.rias');
  //   }
  // }, []);

  return (
    <html
      lang="es"
      suppressContentEditableWarning
      className={`${minervaModern.variable} ${poppins.variable} ${aime.variable} ${sanomatSans.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <GTMTagsManager />
      </head>
      <body>
        <GTMNoScripts />
        {enableWarranty && <WarrantyProviderManager />}
        <StoreProvider>
          <ThemeProvider>
            <BreakpointProvider>
              <PosUmsPermissionBootstrap locale={locale} />
              {children}
              {contextHolder}
              {apiModalContextHolder}
            </BreakpointProvider>
            <PosUttInitialScript />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
