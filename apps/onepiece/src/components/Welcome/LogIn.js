import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import ApiClient from 'helpers/ApiClient';
import { login } from 'redux/modules/auth';
import { setSubscribed } from 'utils/cookies';
import { useForm } from 'react-hook-form';
import { Button } from 'components/Button';
import Input from 'components/HookForm/Input';
import SvgIcon from 'components/SvgIcon';
import { EVENT_SIGN_IN } from 'utils/track/constants';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Box, Grid, Typography } from '@castlery/fortress';
import { Link } from 'react-router';
import { getUrl } from 'pages';
import { phIdentify } from 'utils/posthog';
import { enableAlert, enablePrivacyPolicy, enableSpecificPrivacyPolicy } from 'config';
import { encryptPassword } from 'utils/passwordEncryption';
import Facebook from './Facebook';
import style from './style.scss';
import AppleSignIn from './AppleSignIn';
import Google from './Google';
import { useAlertTermsModal } from './hooks/terms';

const LogIn = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
  });
  const { desktop } = useBreakpoints();
  const dispatch = useDispatch();
  const { className, onCartLoaded, onSuccess, onResetPass, onSignUp } = props;
  const client = new ApiClient();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const checkTerms = useAlertTermsModal();

  const onLogIn = async (result) => {
    if (onCartLoaded) {
      await login(result, null, true)(dispatch);
      onCartLoaded();
    } else if (onSuccess) {
      await login(result)(dispatch);
      onSuccess();
    } else {
      await login(result)(dispatch);
    }
    dispatch({
      type: EVENT_SIGN_IN,
      result: {
        user: window.__user,
        method: 'castlery sign in',
      },
    });
    phIdentify(window.__user.emailHashed);
    setProcessing(false);
  };

  const onSubmit = async (formData) => {
    setProcessing(true);
    try {
      setProcessing(true);
      const result = await client.post('/oauth/token', {
        data: {
          grant_type: 'password',
          username: formData.email,
          version: 1,
          password: encryptPassword(formData.password),
        },
      });
      setSubscribed();
      checkTerms({
        accessToken: result.access_token,
        isNeedAlert: enableAlert,
        onConfirm: () => {
          onLogIn(result);
        },
        onCancel: () => {
          setProcessing(false);
        },
      });
    } catch (error) {
      if (error?.errors?.[0]?.code === 429) {
        const errMsg = 'Too many requests have been made. Please try again later.';
        setError(errMsg);
      } else {
        setError('Your email and password do not match.');
      }
      setProcessing(false);
    }
  };
  return (
    <Box
      sx={{
        maxWidth: (theme) => theme.spacing(90),
      }}
      className={classNames(style.login, className)}
    >
      <h2 className={style.title}>Welcome</h2>

      <p className={style.desc}>
        {!desktop
          ? 'Log in or sign up for an account, and be updated every step of the way.'
          : 'Log in or sign up for an account. Furniture shopping is about to get exciting, and we wouldn’t want you to miss out on anything.'}
      </p>

      <div className={style.wrapper}>
        <div className={`${style.wrapper}__quickBtn`}>
          <p>Quick Log in</p>
          <Facebook textButton="Sign in with Facebook" onCartLoaded={onCartLoaded} onSuccess={onSuccess} isLogin />
          <AppleSignIn text="Sign in with Apple" onCartLoaded={onCartLoaded} onSuccess={onSuccess} isLogin />
          <Google text="signin_with" onCartLoaded={onCartLoaded} onSuccess={onSuccess} isLogin />
        </div>

        <div className={style.or}>
          <span>or</span>
        </div>

        <div className={`${style.wrapper}__form`}>
          <p>Log in with Email</p>
          {error && <div className={style.error}>{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="email"
              name="Email"
              type="email"
              autoComplete="email"
              isRequired
              register={register}
              errors={errors}
            />
            <Input
              label="password"
              name="Password"
              type="password"
              autoComplete="current-password"
              isRequired
              minLength={6}
              register={register}
              errors={errors}
            />
            <div
              className={classNames(`${style.login}__fp`, {
                'is-disabled': processing,
              })}
            >
              <a onClick={processing ? null : onResetPass} role="button" tabIndex="0">
                Forgot Password?
              </a>
            </div>
            <div className={style.submit}>
              <Button
                data-selenium="log_in"
                text="Log in"
                type="submit"
                loading={processing}
                disabled={processing}
                width="100%"
                size="medium"
                rightIcon={<SvgIcon name="line-right-arrow" width={24} />}
              />
            </div>
          </form>

          <div className={style.footer}>
            New to Castlery?{' '}
            <a onClick={onSignUp} role="button" tabIndex="0">
              Sign up
            </a>
          </div>
        </div>
      </div>
      {enablePrivacyPolicy && !enableSpecificPrivacyPolicy && (
        <Box
          sx={{
            mt: 6,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            pl: {
              xs: 0,
              md: 2,
            },
          }}
          className={`${style.signup}__terms__checkbox`}
        >
          <Grid
            width={{
              xs: '100%',
              md: '85%',
            }}
            container
            wrap="nowrap"
            spacing={1}
          >
            <Grid item xs>
              <Typography level="caption1" textColor="brand.charcoal.600" lineHeight="md" width="auto">
                By logging in, you have read, understood, and agree to Castlery's{' '}
                <Link to={getUrl('terms-of-use')} target="_blank" rel="noopener">
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link to={getUrl('privacy-policy')} target="_blank" rel="noopener">
                  Privacy Policy
                </Link>
                .
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

LogIn.propTypes = {
  onSignUp: PropTypes.func.isRequired,
  onResetPass: PropTypes.func.isRequired,
  onSuccess: PropTypes.func, // used after loading user
  onCartLoaded: PropTypes.func, // used if you want to do sth after loading user and cart
  className: PropTypes.string,
};

export default LogIn;
