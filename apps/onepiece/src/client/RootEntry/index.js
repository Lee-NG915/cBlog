/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import PropTypes from 'prop-types';
import { set as setCookie } from 'helpers/Cookie';
import { countries as COUNTRIES, enableUnifiedDataLayer } from 'config';
import Logo from 'components/Logo';
import SvgIcon from 'components/SvgIcon';
import { DualBox } from 'components/DualBox';
import Helmet from 'react-helmet';
import lang from 'utils/lang';
import cloneDeep from 'lodash/cloneDeep';
import Script from 'components/Script';
import { ThemeCompositionProvider } from 'theme/themeProvider';

import serialize from 'serialize-javascript';
import { useBreakpoints } from '@castlery/fortress';
import style from './style.scss';

const CountrySelector = ({ country, appContext }) => {
  const { desktop } = useBreakpoints();
  const countries = cloneDeep(COUNTRIES);
  const countryCode = country || (__CLIENT__ && window.__countryCode);

  if (countryCode) {
    const countryCodes = countries.map((item) => item.code);
    const index = countryCodes.indexOf(countryCode);

    if (index > 0) {
      countries.unshift(...countries.splice(index, 1));
    }
  }

  const handleSelectCountry = (selectedCountry = __COUNTRY__) => {
    setCookie('castlery_shop', selectedCountry.toLowerCase(), 365, '/');
  };

  const CountrySelectorText = () => (
    <div>
      <a to="/" className={`${style.countrySelector}__logo`}>
        <Logo sx={{ height: desktop ? '50px' : '20px' }} />
      </a>

      <div
        style={{
          paddingLeft: desktop ? '60px' : '24px',
          paddingRight: desktop ? '60px' : '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <h2 className={`${style.countrySelector}__siteHint`}>Choose your local site to shop</h2>

        <div className={`${style.countrySelector}__siteBox`}>
          {countries.map((country) => (
            <a
              className={`${style.countrySelector}__site`}
              key={country.key}
              href={country.route}
              onClick={() => handleSelectCountry(country.key)}
              style={{ cursor: 'pointer', textAlign: 'left' }}
            >
              <span>{country.name}</span>
              <SvgIcon name="line-right-arrow" className={`${style.countrySelector}__arrow`} color="primary" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ThemeCompositionProvider appContext={appContext}>
        <Helmet>
          <title>{`${lang.t('pages.home.metaTitle')} | Castlery`}</title>
          <meta name="description" content={`${lang.t('pages.home.metaDescription')}`} />
          <meta name="keywords" content={lang.t('common.keywords')} />
          <meta property="og:title" content={`${lang.t('pages.home.metaTitle')} | Castlery`} />
          <meta property="og:description" content={`${lang.t('pages.home.metaDescription')}`} />
          <link rel="alternate" href="https://www.castlery.com/us" hrefLang="en-US" />
          <link rel="alternate" href="https://www.castlery.com/sg" hrefLang="en-SG" />
          <link rel="alternate" href="https://www.castlery.com/au" hrefLang="en-AU" />
          <link rel="alternate" href="https://www.castlery.com/ca" hrefLang="en-CA" />
          <link rel="alternate" href="https://www.castlery.com/uk" hrefLang="en-GB" />
          <link rel="alternate" href="https://www.castlery.com/" hrefLang="x-default" />
        </Helmet>

        <Script text={`window.__countryCode=${serialize(countryCode)};`} position="body" strategy="beforeInteractive" />

        <div className={`${style.countrySelector}`}>
          <div className={`${style.countrySelector}__box`}>
            <DualBox
              containerClassName={`${style.countrySelector}__proportion`}
              leftClassName={`${style.countrySelector}__textBox`}
              leftComponent={<CountrySelectorText />}
              rightComponent={<div className={`${style.countrySelector}__selectorRight`} />}
              whichIsTop="right"
            />
          </div>

          {__GTM_ID__ && (
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];
          dataLayer.push({
            'event':'pageview',
            'pageContent': 'settings', 
            'pageProduct': 'other',
            'pageCountry': '', 
            'pageCat': 'settings', 
            'pageType': 'settings',
            'userID': '', 
            'userType': '', 
            'currencyCode': '', 
            'userStatus': '',
            'pageVariant':''
            });`,
              }}
            />
          )}
          {!enableUnifiedDataLayer && __GTM_ID__?.split(',').length > 1 && (
            <script
              dangerouslySetInnerHTML={{
                __html: `window.oldGtmDataLayer = window.oldGtmDataLayer || [];
          oldGtmDataLayer.push({
            'event':'pageview',
            'pageContent': 'settings', 
            'pageProduct': 'other',
            'pageCountry': '', 
            'pageCat': 'settings', 
            'pageType': 'settings',
            'userID': '', 
            'userType': '', 
            'currencyCode': '', 
            'userStatus': '',
            'pageVariant':''
            });`,
              }}
            />
          )}
        </div>
      </ThemeCompositionProvider>
    </>
  );
};
CountrySelector.propTypes = {
  country: PropTypes.string,
  appContext: PropTypes.object,
};

export default CountrySelector;
