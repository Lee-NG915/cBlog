import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { loadIfNeeded as loadUser, logout } from 'redux/modules/auth';
import { init as initLocation } from 'redux/modules/geolocation';
import { PRODUCTS_NUM } from 'redux/modules/fixBar';
import { initMenu } from 'redux/modules/marketing';
import { loadIfNeeded as loadNotice, selectedErrorInfo, updateErrorCore } from 'redux/modules/notice';
import { connect, useDispatch, useSelector } from 'react-redux';
import { get as getCookie, set as setCookie } from 'helpers/Cookie';
import { trackSignUpNewsletter } from 'utils/tracking';
import { hasSubscribed, setSubscribed } from 'utils/cookies';
import { hideSubscriptionBar } from 'redux/modules/subscriptionBar';
import { countries, enableAlert, globalFeatureInAU } from 'config';
import { getNumOfPageViews } from 'utils/track/common';
import { EVENT_FORM_SUBMIT } from 'utils/track/constants';
import { useFrame } from 'hooks/frame';
import { useAlertTermsModal, useLastTerms } from 'components/Welcome/hooks/terms';
import { getUrl } from 'pages';
import Legacy from './Legacy';

const GlobalModal = () => {
  const frame = useFrame();
  const dispatch = useDispatch();
  const { errorCode, errorZipcode } = useSelector(selectedErrorInfo);
  const user = useSelector((state) => state.auth?.user);
  const checkTerms = useAlertTermsModal();
  const lastTerms = useLastTerms();

  useEffect(() => {
    // 白名单page
    const whiteList = ['/checkout', '/terms-of-use'];
    const isWhiteListPage = whiteList.some((item) => window.location?.pathname.includes(item));
    if (user && lastTerms && enableAlert && !isWhiteListPage) {
      checkTerms({
        accessToken: user?.access_token,
        isNeedAlert: true,
        onConfirm: () => {},
        onCancel: () => {
          logout({ reload: false });
          window.location.replace(getUrl('login'));
        },
      });
    }
  }, [lastTerms]);

  useEffect(() => {
    if (+errorCode === 40011) {
      frame.openModal('subscription', {
        type: 'ZIPCODE_FAILURE_POPUP',
        zipcode: errorZipcode,
        onClose: () => {
          dispatch(updateErrorCore(''));
        },
      });
    }
  }, [dispatch, errorCode, errorZipcode, frame]);
  return <></>;
};

@asyncLoad([
  ({ store: { dispatch } }) => dispatch(loadUser()),
  ({ store: { dispatch } }) => dispatch(initLocation()),
  ({ store: { dispatch } }) => dispatch(initMenu()),
  ({ store: { dispatch } }) => dispatch(loadNotice()),
])
@connect(
  (state) => ({
    isBrowserSupported: state.browser.supported,
    isCastleryApp: state.browser.isCastleryApp,
    geolocation: state.geolocation.data,
    user: state.auth.user,
    historyViews: state.tracking.historyViews,
  }),
  {
    hideSubscriptionBar,
    trackFormSubmit: (result) => (dispatch) => dispatch({ type: EVENT_FORM_SUBMIT, result }),
  }
)
export default class App extends React.Component {
  static propTypes = {
    isBrowserSupported: PropTypes.bool,
    isCastleryApp: PropTypes.bool,
    geolocation: PropTypes.object,
    user: PropTypes.object,
    historyViews: PropTypes.array,
    children: PropTypes.node,
    hideSubscriptionBar: PropTypes.func,
    router: PropTypes.object,
    trackFormSubmit: PropTypes.func,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  componentDidMount() {
    const { frame } = this.context;
    const { geolocation = {}, isCastleryApp } = this.props;

    // #FIXME: https://perishablepress.com/html-base-tag/ base tag doesn't work with relative url that starts with /
    setCookie('castlery_shop', __COUNTRY__.toLowerCase(), 365, '/');

    const selectCountryHintHidden = JSON.parse(getCookie('select_country_hint_hidden') || false);
    const countryCodes = countries.map((country) => country.code);
    if (
      countryCodes.includes(geolocation.country_code) &&
      __COUNTRY__ !== geolocation.country_code &&
      !selectCountryHintHidden &&
      !isCastleryApp
    ) {
      frame.openModal('countrySelect', {
        countryCodeByIP: geolocation.country_code,
      });
    }
    if (!window.DYO) {
      this.setUpExitIntentPopup();
    } else {
      if (!window.dyToNative) {
        window.dyToNative = {};
      }
      window.dyToNative.trackSignUpNewsletter = (...rest) => {
        trackSignUpNewsletter(...rest);
        this.props.trackFormSubmit({
          action: 'Newsletter Sign-up',
          label: this.props.user?.id,
          method: rest?.[0],
        });
      };
      window.dyToNative.successSubscribed = this.successSubscribed;
      window.dyToNative.dyRouter = this.dyRouter;
    }
  }

  componentWillUnmount() {
    if (!window.DYO) {
      document.documentElement.removeEventListener('mouseleave', this.handleExit);
    }
  }

  isExitIntentPopupDisabled = () => {
    const { user } = this.props;
    const isSubscribed = hasSubscribed();
    const isHidden = JSON.parse(getCookie('fixmodal_hidden') || false);
    return isSubscribed || isHidden || user;
  };

  setUpExitIntentPopup = () => {
    if (!this.isExitIntentPopupDisabled()) {
      document.documentElement.addEventListener('mouseleave', this.handleExit);
    }
  };

  handleExit = (e) => {
    const { frame } = this.context;
    if (e.clientY <= 20) {
      const viewedProducts = JSON.parse(getCookie('viewed_products') || '[]');
      const fixBarHidden = JSON.parse(getCookie('fixbar_hidden') || false);
      // const isSubscribed = JSON.parse(getCookie('has_subscribed') || false);
      const isSubscribed = hasSubscribed();
      const pageViews = getNumOfPageViews(this.props.historyViews);
      const isFixBarShown =
        globalFeatureInAU && viewedProducts.length >= PRODUCTS_NUM && !isSubscribed && !fixBarHidden;

      // show if no user or not subscribed, or fixBar not shown, or fixmodal(exit intent popup) not hidden
      if (!isFixBarShown && pageViews > 1 && !frame.isModalShown()) {
        frame.openModal('subscription', {
          type: 'EXIT_INTENT',
          onClose: this.handleClose,
        });
      }
    }
  };

  successSubscribed = () => {
    const { hideSubscriptionBar: hideSubscription } = this.props;
    setSubscribed();
    hideSubscription({ showOnProductPage: false, showOnHomePage: false });
  };

  handleClose = () => {
    setCookie('fixmodal_hidden', JSON.stringify(true), 7);
    document.documentElement.removeEventListener('mouseleave', this.handleExit);
  };

  dyRouter = (path) => {
    const { router } = this.props;
    const { frame } = this.context;
    const index = path.indexOf(__BASE_ROUTE__);

    frame.removeAllModals();
    if (index !== -1) {
      const newPath = path.slice(index + 3);
      router.push(newPath);
    } else {
      router.push(path);
    }
  };

  render() {
    const { isBrowserSupported, children } = this.props;
    if (isBrowserSupported) {
      return (
        <>
          <GlobalModal />
          {children}
        </>
      );
    }
    return <Legacy />;
  }
}
