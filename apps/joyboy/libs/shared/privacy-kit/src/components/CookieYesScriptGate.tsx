'use client';

import { CookieYesConsentCategories } from '../types';
import Script, { ScriptProps } from 'next/script';

interface CookieYesScriptGateProps extends Omit<ScriptProps, 'data-cookieyes'> {
  /**
   * Cookie consent categories required to load this script
   * The script will only load when the user has granted consent for ALL specified categories
   */
  categories: CookieYesConsentCategories[];
}

/**
 * CookieYesScriptGate - Conditionally load third-party scripts based on cookie consent
 *
 * **USE THIS FOR:** Third-party `<script>` tags (analytics, ads, tracking scripts)
 * **DO NOT USE FOR:** React components (use `ScriptGate` component instead)
 *
 * This component wraps Next.js's Script component and adds the `data-cookieyes` attribute
 * to enable CookieYes's automatic script blocking/loading based on user consent.
 *
 * @example
 * // Google Analytics script gated by analytics consent
 * <CookieYesScriptGate
 *   categories={['analytics']}
 *   src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
 *   strategy="afterInteractive"
 * />
 *
 * @example
 * // Facebook Pixel gated by advertisement consent
 * <CookieYesScriptGate
 *   categories={['advertisement']}
 *   id="facebook-pixel"
 *   strategy="afterInteractive"
 * >
 *   {`
 *     !function(f,b,e,v,n,t,s)
 *     {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
 *     n.callMethod.apply(n,arguments):n.queue.push(arguments)};
 *     if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
 *     n.queue=[];t=b.createElement(e);t.async=!0;
 *     t.src=v;s=b.getElementsByTagName(e)[0];
 *     s.parentNode.insertBefore(t,s)}(window, document,'script',
 *     'https://connect.facebook.net/en_US/fbevents.js');
 *     fbq('init', 'YOUR_PIXEL_ID');
 *   `}
 * </CookieYesScriptGate>
 *
 * @example
 * // Script requiring multiple consent categories
 * <CookieYesScriptGate
 *   categories={['analytics', 'advertisement']}
 *   src="https://example.com/advanced-tracking.js"
 * />
 *
 * @see https://www.cookieyes.com/documentation/implement-prior-consent-using-cookieyes/
 * @see For React components, use `ScriptGate` component instead
 */
export const CookieYesScriptGate = ({ categories, ...scriptProps }: CookieYesScriptGateProps) => {
  // CookieYes expects comma-separated category names in the data-cookieyes attribute
  // This tells CookieYes to block the script until ALL specified categories are accepted
  const dataCkyAttributes = categories.map((category) => `cookieyes-${category}`).join(',');

  return <Script {...scriptProps} data-cookieyes={dataCkyAttributes} />;
};
