import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'components/Helmet';
import Header from 'containers/Checkout/components/Header';
import Footer from 'containers/Checkout/components/Footer';
import ApiClient from 'helpers/ApiClient';
import { login } from 'redux/modules/auth';
import { getUrl } from 'pages';
import { useDispatch } from 'react-redux';
import { EVENT_RESET_PASSWORD } from 'utils/track/constants';
import { Container, Button } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { ArrowRight } from '@castlery/fortress/Icons';
import { enableO2O } from 'config';
import { encryptPassword } from 'utils/passwordEncryption';
import style from './style.scss';
import ResetPasswordForm from './version';

const ResetPassword = ({ location }, { router }) => {
  const [tokenError, setTokenError] = useState(false);
  const [err, setErr] = useState('');
  const client = new ApiClient();
  const dispatch = useDispatch();
  const { desktop, mobile } = useBreakpoints();
  // https://app.clickup.com/t/866adx780?comment=90090023147074
  const { from_email: fromEmail, redirect_page_name: redirectPageName = '' } = location?.query || {};

  const isFromPosEmail = enableO2O && fromEmail === 'true';

  const handleToNextPage = () => {
    let redirectURL = __BASE_URL__;
    if (getUrl(redirectPageName)) {
      redirectURL = getUrl(redirectPageName);
    }
    if (redirectURL === __BASE_URL__) {
      return (window.location.href = redirectURL);
    }

    return router.push(redirectURL);
  };
  const trackResetPassword = (status) => {
    if (isFromPosEmail) {
      dispatch({
        type: EVENT_RESET_PASSWORD,
        result: {
          status,
        },
      });
    }
  };

  const checkToken = () => {
    client
      .get(`/users/validate_reset_password_token/${location.query.secret}`)
      .then((res) => setTokenError(false))
      .catch((err) => setTokenError(true));
  };
  useEffect(() => {
    checkToken();
  }, []);

  const OnSubmit = React.useCallback((formData, refresh = () => {}) => {
    client
      .post('/users/reset_password', {
        data: {
          password: encryptPassword(formData.password),
          reset_password_token: location.query.secret,
          version: 1,
        },
      })
      .then((result) => {
        refresh();
        client
          .post('/oauth/token', {
            data: {
              grant_type: 'password',
              username: result.email,
              version: 1,
              password: encryptPassword(formData.password),
            },
          })
          .then((res) => {
            dispatch(login(res));
            trackResetPassword('success');
            handleToNextPage();
          })
          .catch(() => {
            trackResetPassword('fail');
            handleToNextPage();
          });
      })
      .catch((error) => {
        const errMsg = error?.errors[0]?.detail || 'Oops, something went wrong. Please try again later.';
        setErr(errMsg);
        refresh();
        trackResetPassword('fail');
      });
  }, []);
  // Cast123@
  return (
    <div className={style.wrapper}>
      <Helmet path={location.pathname} />
      <Header />
      <div className={`${style.wrapper}__center`}>
        <Container fixed>
          <div className={style.reset}>
            {desktop && <h2 className={`${style.reset}__title`}>{isFromPosEmail ? 'Set' : 'Reset'} Your Password</h2>}
            {err && <div className={`${style.reset}__error`}>{err}</div>}
            {tokenError ? (
              <div className={`${style.reset}__error ${style.reset}__error_special`}>
                <div>Oops! The password reset link has expired.</div>
                <div>Please try again.</div>
                <Button
                  type="submit"
                  endDecorator={<ArrowRight />}
                  sx={{
                    width: mobile ? '100%' : 454,
                    justifyContent: 'space-between',
                    marginY: (theme) => theme.spacing(2),
                  }}
                  onClick={() => {
                    handleToNextPage();
                  }}
                >
                  Return
                </Button>
              </div>
            ) : (
              <ResetPasswordForm OnSubmit={OnSubmit} />
            )}
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

ResetPassword.propTypes = {
  location: PropTypes.object.isRequired,
};

ResetPassword.contextTypes = {
  router: PropTypes.object,
};

export default ResetPassword;
