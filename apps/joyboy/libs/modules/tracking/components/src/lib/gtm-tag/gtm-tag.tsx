'use client';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { EcEnv, WEB_CHANNEL } from '@castlery/config';
import Script from 'next/script';
import {
  isDefaultDeniedRegion,
  getDefaultRegionalGoogleConsentMapping,
  GoogleConsentSchema,
} from '@castlery/shared-privacy-kit';

/**
 * Serialize GoogleConsentSchema object to a JavaScript object literal string
 * for embedding in inline script tags.
 *
 * IMPORTANT: This must return a valid JS object literal string, NOT the raw object.
 * Using template literals with objects directly would cause [object Object] to be inserted,
 * leading to SyntaxError in the browser.
 *
 * @see JOYBOY-WEB-1WF - SyntaxError in iOS Instagram WebView caused by [object Object]
 */
const serializeGoogleConsentToJsLiteral = (consent: GoogleConsentSchema): string => {
  // Generate proper JavaScript object property assignments
  // e.g., "'ad_storage': 'granted', 'ad_user_data': 'denied', ..."
  return Object.entries(consent)
    .map(([key, value]) => `'${key}': '${value}'`)
    .join(',\n                        ');
};

/**
 * GTM 预加载资源组件
 * 使用 ReactDOM.preconnect 提前建立连接，提高 GTM 脚本加载优先级
 */
export const GTMPreloadResources = () => {
  const GTM_ID = EcEnv.NEXT_PUBLIC_GTM_ID;
  const ids = GTM_ID?.split(',');

  // 使用 ReactDOM.preconnect 和 prefetchDNS 提前建立连接
  // 这会在 SSR 时在 HTML 中插入 <link rel="preconnect"> 和 <link rel="dns-prefetch">
  // 大幅提高后续资源加载优先级
  // @ts-expect-error - ReactDOM.preconnect is available in React 18.3+ and Next.js
  ReactDOM.preconnect('https://www.googletagmanager.com');
  // @ts-expect-error - ReactDOM.prefetchDNS is available in React 18.3+ and Next.js
  ReactDOM.prefetchDNS('https://www.googletagmanager.com');

  // 预加载 GTM 脚本文件，将优先级从 Low 提升到 High
  // 这是关键：直接告诉浏览器需要加载这个脚本，浏览器会提高其优先级
  ids?.forEach((id) => {
    // @ts-expect-error - ReactDOM.preload is available in React 18.3+ and Next.js
    ReactDOM.preload(`https://www.googletagmanager.com/gtm.js?id=${id}`, {
      as: 'script',
    });
  });

  return null;
};

/**
 * https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries
 * @returns
 */
export function GTMTagsManager() {
  const GTM_ID = EcEnv.NEXT_PUBLIC_GTM_ID;
  const ids = GTM_ID?.split(',');
  const isWeb = EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase() === WEB_CHANNEL.toLowerCase();
  const isDefaultDenied = isDefaultDeniedRegion(EcEnv.NEXT_PUBLIC_COUNTRY);

  return (
    <>
      <GTMPreloadResources />
      {ids?.map((id) => {
        return (
          <React.Fragment key={id}>
            {/* note：当gtm js策略是beforeInteractive时，需要在每个gtm js之前，重新设置默认consent */}
            {isWeb && (
              <Script id={`default-consent-${id}`} strategy="beforeInteractive" type="text/javascript">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('consent', 'default', {
                        ${serializeGoogleConsentToJsLiteral(
                          getDefaultRegionalGoogleConsentMapping(EcEnv.NEXT_PUBLIC_COUNTRY)
                        )},
                        wait_for_update: 2000,
                    });
                    gtag('set', 'ads_data_redaction', true);
                    gtag('set', 'url_passthrough', true);
                `}
              </Script>
            )}
            {/* <GoogleTagManager key={id} gtmId={id} dataLayerName={'dataLayer'} /> */}
            <Script
              id={`gtm-${id}`}
              strategy="beforeInteractive"
              {...(isDefaultDenied ? { 'data-cookieyes': 'cookieyes-advertisement' } : {})}
              dangerouslySetInnerHTML={{
                __html: `
                    (function(w,d,s,l,i){
                      w[l]=w[l]||[];
                      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                      var f=d.getElementsByTagName(s)[0],
                      j=d.createElement(s),
                      dl=l!='dataLayer' ? '&l='+l : '';
                      j.async=true;
                      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                      f.parentNode.insertBefore(j,f);
                      })(window,document,'script','dataLayer','${id}');
                  `.trim(),
              }}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}

export const GTMNoScripts = () => {
  const GTM_ID = EcEnv.NEXT_PUBLIC_GTM_ID;
  const ids = GTM_ID?.split(',');
  return (
    <>
      {ids?.map((id) => {
        return (
          <noscript key={id}>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${id}`}
              height="0"
              width="0"
              title="GTM script"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        );
      })}
    </>
  );
};
