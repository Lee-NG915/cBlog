import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { getRecommendationContext, setCurrentContext } from 'utils/dy';
import Script, { NoScript } from 'components/Script';
import config from 'config';
import { ConsentModeScript, getConsentCookie } from './ConsentModeScript';

const ThirdScripts = ({ store, pageType }) => {
  const dyContext =
    store &&
    getRecommendationContext({
      pageType,
      state: store.getState(),
    });
  setCurrentContext(dyContext);

  const customer = store?.getState()?.auth?.user;

  return (
    <>
      {/* Dynamic Yield integration */}
      {/* https://support.dynamicyield.com/hc/en-us/articles/360023125113-Dynamic-Yield-Scripts#best-practices-0-2 */}

      {__DY_ENABLED__ && (
        <>
          <Helmet>
            <link rel="preconnect" href="https://dy-api.com" crossOrigin />
            <link rel="preconnect" href="https://static.klaviyo.com" crossOrigin />
            <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin />
            <link rel="preconnect" href="https://connect.facebook.net" crossOrigin />
            <link rel="preconnect" href="https://cdn.castlery.com.au" crossOrigin />
            <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin />
            <link rel="preconnect" href="https://tag.criteo.com" crossOrigin />
            <link rel="preconnect" href="https://js.stripe.com" crossOrigin />
            <link rel="dns-prefetch" href="https://direct.dy-api.com/v2/serve/user/choose" />
            <link rel="preconnect" href="//cdn.dynamicyield.com" crossOrigin />
            <link rel="preconnect" href="//st.dynamicyield.com" crossOrigin />
            <link rel="preconnect" href="//rcom.dynamicyield.com" crossOrigin />
            <link rel="dns-prefetch" href="//cdn.dynamicyield.com" />
            <link rel="dns-prefetch" href="//st.dynamicyield.com" />
            <link rel="dns-prefetch" href="//rcom.dynamicyield.com" />
          </Helmet>
          {dyContext && (
            <Script
              strategy="beforeInteractive"
              text={`window.DY = window.DY || {}; DY.recommendationContext = ${JSON.stringify(dyContext)}`}
            />
          )}
          {/* FIXME  https://web.dev/optimizing-content-efficiency-loading-third-party-javascript/#ab-test-smaller-samples-of-users
            A good alternative in this case is to send A/B testing scripts for only a subset of your user base (e.g 10% vs 100%)
            , ideally attempting to decide whether they belong in a test sample on the server-side
            . This improves the loading experience for the majority of users while still making split-testing possible.
      */}
          <Script
            {...(config.enabledConsentBlocked && {
              ...config.cookieYesConsentAdsAttribute,
            })}
            strategy="beforeInteractive"
            src={`//cdn.dynamicyield.com/api/${__DY_SECTION_ID__}/api_dynamic.js`}
            type="text/javascript"
          />
          <Script
            {...(config.enabledConsentBlocked && {
              ...config.cookieYesConsentAdsAttribute,
            })}
            strategy="beforeInteractive"
            src={`//cdn.dynamicyield.com/api/${__DY_SECTION_ID__}/api_static.js`}
            type="text/javascript"
          />
        </>
      )}

      {/* google tag manager */}
      {__GTM_ID__ &&
        __GTM_ID__.split(',').map((gtmId, index) => {
          const names = config.enableUnifiedDataLayer
            ? ['dataLayer', 'dataLayer', 'dataLayer']
            : ['dataLayer', 'oldGtmDataLayer', 'dataLayer'];

          return (
            <Fragment key={gtmId}>
              {/* // 先插入 consent 相关脚本 https://developers.google.com/tag-platform/security/guides/consent?hl=zh-cn#configure_default_behavior */}
              <ConsentModeScript />
              {/* 再插入 GTM 初始化脚本 */}
              <Script
                {...(config.enabledConsentBlocked && {
                  ...config.cookieYesConsentAdsAttribute,
                })}
                // https://nextjs.org/docs/basic-features/script#afterinteractive
                strategy="beforeInteractive" // FIXME: 这里需要调整，因为 GTM 的脚本需要先执行，才能获取到 consent 的值
                text={
                  `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':` +
                  `new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],` +
                  `j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=` +
                  `'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);` +
                  `})(window,document,'script','${names[index]}','${gtmId}');`
                }
              />
              <NoScript position="body">
                <iframe
                  src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                  height="0"
                  width="0"
                  title="GTM script"
                  style={{ display: 'none', visibility: 'hidden' }}
                />
              </NoScript>
            </Fragment>
          );
        })}

      {__KLAVIYO_PUBLIC_KEY__ && (
        <>
          <Script
            // FIXME To be confirmed if beforeInteractive is necessary
            {...(config.enabledConsentBlocked && {
              ...config.cookieYesConsentAdsAttribute,
            })}
            strategy="beforeInteractive"
            type="application/javascript"
            async
            src={`https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${__KLAVIYO_PUBLIC_KEY__}`}
          />
          <Script strategy="beforeInteractive" text="var _learnq = _learnq || [];" />
        </>
      )}
      {/* https://stripe.com/docs/radar/checklist, include Stripe.js on every page of your site */}
      {__STRIPE_ENABLED__ && <Script id="stripe-js" src="https://js.stripe.com/v3/" async />}

      {/* https://app.clickup.com/t/d6y6w1 */}
      {/* Podcast pixel（Podsights） */}
      {__PODCAST_PIXEL_ID__ && (
        <Script
          {...(config.enabledConsentBlocked && {
            ...config.cookieYesConsentAdsAttribute,
          })}
          strategy="beforeInteractive"
          text={
            '(function(w, d){' +
            "var id='pdst-capture', n = 'script';" +
            'if (!d.getElementById(id)){' +
            'w.pdst = w.pdst || function() {(w.pdst.q = w.pdst.q || []).push(arguments);};' +
            'var e = d.createElement(n); e.id = id; e.defer=1;' +
            "e.src = 'https://cdn.pdst.fm/ping.min.js';" +
            'var s = d.getElementsByTagName(n)[0];' +
            's.parentNode.insertBefore(e, s);}' +
            `w.pdst('conf', { key: '${__PODCAST_PIXEL_ID__}' });` +
            "w.pdst('view');" +
            '})(window, document);'
          }
        />
      )}

      {/* https://github.com/aFarkas/lazysizes/tree/1523a4ff4579e170355c7607f445689b43229caf/plugins/rias#configurationoptions */}
      {/* <Helmet>
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/g/lazysizes(lazysizes.min.js+plugins/rias/ls.rias.min.js)"
          as="script"
        />
      </Helmet>
      <Script
        strategy="beforeInteractive"
        text={
          // https://github.com/aFarkas/lazysizes#js-api---options
          `
          window.lazySizesConfig = window.lazySizesConfig || {};
          window.lazySizegIPSbo6sConfig.lazyClass = 'img-lazyload';
          window.lazySizesConfig.loadingClass = 'img-lazyloading';
          window.lazySizesConfig.loadedClass = 'img-lazyloaded';
          window.lazySizesConfig.rias = window.lazySizesConfig.rias || {};
          `
        }
      />
      <Script
        strategy="beforeInteractive"
        src="https://cdn.jsdelivr.net/g/lazysizes(lazysizes.min.js+plugins/rias/ls.rias.min.js)"
        async
      /> */}

      {/* cookieYes */}
      {__COOKIEYES_ENABLED__ && __COOKIYES_CDN__ && (
        <Script id="cookieyes" type="text/javascript" src={__COOKIYES_CDN__} strategy="afterInteractive" />
      )}
      {/* Emplifi */}
      {__PIXLEE_API_KEY__ && (
        <Script
          {...(config.enabledConsentBlocked && {
            ...config.cookieYesConsentAdsAttribute,
          })}
          src="https://assets.pixlee.com/assets/pixlee_events.js"
          strategy="afterInteractive"
          type="text/javascript"
          onReady={() => {
            if (typeof Pixlee_Analytics !== 'undefined') {
              global.pixlee_analytics = new Pixlee_Analytics(__PIXLEE_API_KEY__);
            }
          }}
        />
      )}
      {/* =========================================================================================================== */}
      {/* =================== UTT : only for UK & CA https://app.clickup.com/t/86eu88pz7 ============================ */}
      {/* =========================================================================================================== */}
      {config.enabledIntegrationUTTByCode && (
        <>
          <Script
            strategy="afterInteractive"
            type="text/javascript"
            text={`(function(a, b, c, d, e, f, g) {e['ire_o'] = c;e[c] = e[c] || function() {(e[c].a = e[c].a || []).push(arguments);};f = d.createElement(b);g = d.getElementsByTagName(b)[0];f.async = 1;f.src = a;g.parentNode.insertBefore(f, g);})('${__UTT_SCRIPT_URL__}','script','ire',document,window);ire('consent', 'default', {'tracking': '${
              getConsentCookie('advertisement') || 'denied'
            }'});`}
          />
          <Script
            id="utt-identify"
            strategy="afterInteractive"
            type="text/javascript"
            text={`
              typeof ire !== 'undefined' && ire('identify', {'customerId': '${
                customer?.id ?? ''
              }' , 'customerEmail': '${customer?.emailHashed ?? ''}'});
            `}
          />
        </>
      )}
    </>
  );
};
ThirdScripts.propTypes = {
  store: PropTypes.object,
  pageType: PropTypes.string,
};

export default ThirdScripts;
