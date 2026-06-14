import React from 'react';
import Script from 'components/Script';
import config from 'config';
import { get as getCookieFromUtils } from 'helpers/Cookie';

// getConsentCookie

export function getConsentCookie(key) {
  const cookieConsent = getCookieFromUtils('cookieyes-consent');
  if (!cookieConsent) return '';

  const { [key]: value } = cookieConsent.split(',').reduce((obj, pair) => {
    pair = pair.split(':');
    obj[pair[0]] = pair[1];
    return obj;
  }, {});
  return value === 'yes' ? 'granted' : 'denied';
}

export const ConsentModeScript = () => {
  function getConsent() {
    // cookieyes-consent 的 key 和 value 的映射关系
    // https://www.cookieyes.com/documentation/implementing-google-consent-mode-using-cookieyes/#Google_Con_8
    const consentToCookieKeysMapping = {
      ad_storage: 'advertisement',
      ad_user_data: 'advertisement',
      ad_personalization: 'advertisement',
      analytics_storage: 'analytics',
      functionality_storage: 'functional',
      personalization_storage: 'functional',
      security_storage: 'necessary',
    };

    const result = Object.entries(config.regionalDefaultConsent)
      .map(([key, value]) => {
        const cookieKey = consentToCookieKeysMapping[key];
        const cookieValue = getConsentCookie(cookieKey);

        return `${key}: '${__COOKIEYES_ENABLED__ ? cookieValue || value : value}'`;
      })
      .join(',\n  ');
    return result;
  }

  return (
    <>
      {/* // 先插入 consent 相关脚本 https://developers.google.com/tag-platform/security/guides/consent?hl=zh-cn#configure_default_behavior */}
      <Script
        strategy="beforeInteractive"
        text={`
             window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('consent', 'default', {${getConsent()},
                wait_for_update: 2000,
             });
             gtag('set', 'ads_data_redaction', true);
             gtag('set', 'url_passthrough', true);
            `}
      />
    </>
  );
};

export default ConsentModeScript;
