import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Script from 'components/Script';
import sha256 from 'crypto-js/sha256';
import config from 'config';

const YotpoScript = ({ getAPI }) => {
  const user = useSelector((state) => state.auth.user);
  const token = user?.email ? sha256(user.email.toLowerCase() + __YOTPO_API_KEY__).toString() : '';

  if (__YOTPO_GUID__ && __YOTPO_ENABLED__) {
    // https://support.yotpo.com/docs/implementing-loyalty-referrals-on-a-custom-or-generic-ecommerce-platform#frontend-elements
    return (
      <>
        <div
          id="swell-customer-identification"
          data-authenticated="true"
          data-email={user?.email}
          data-id={user?.id}
          data-token={token}
          data-tags='["wholesale"]'
          style={{ display: 'none' }}
        />

        {getAPI ? (
          <Script
            {...(config.enabledConsentBlocked && {
              ...config.cookieYesConsentAdsAttribute,
            })}
            src={`https://cdn-loyalty.yotpo.com/loader/${__YOTPO_GUID__}.js`}
            async
          />
        ) : (
          <Script
            {...(config.enabledConsentBlocked && {
              ...config.cookieYesConsentAdsAttribute,
            })}
            src={`https://cdn-widgetsrepository.yotpo.com/v1/loader/${__YOTPO_GUID__}`}
            async
            onReady={() => {
              window?.yotpoWidgetsContainer?.initWidgets?.();
            }}
          />
        )}
      </>
    );
  }
  return null;
};

YotpoScript.propTypes = {
  getAPI: PropTypes.bool,
};

YotpoScript.defaultProps = {
  getAPI: false,
};

export default YotpoScript;
