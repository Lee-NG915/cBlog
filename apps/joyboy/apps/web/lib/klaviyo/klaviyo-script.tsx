'use client';

import { EcEnv } from '@castlery/config';
import Script from 'next/script';
import { KlaviyoPreloadResources } from './klaviyo-resource';

export function KlaviyoScript() {
  const publicKey = EcEnv.NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY;
  if (!publicKey) return null;
  return (
    <>
      <KlaviyoPreloadResources />
      {/* developer doc: https://developers.klaviyo.com/en/docs/javascript_api#add-the-klaviyo-snippet */}
      <Script
        id="klaviyo-main"
        strategy="afterInteractive"
        src={`https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${publicKey}`}
        onError={(e) => {
          console.warn('Klaviyo script failed to load:', e);
        }}
      />
      <Script
        id="klaviyo-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            try {
              window._learnq = window._learnq || [];
              if (Array.isArray(window._learnq)) {
                window._learnq.push(['account', '${publicKey}']);
              }
            } catch (e) {
              console.warn('Klaviyo initialization failed:', e);
            }
          `,
        }}
      />
    </>
  );
}
