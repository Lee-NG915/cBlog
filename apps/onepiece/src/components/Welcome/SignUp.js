import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import { login, updateUserTermsVersion } from 'redux/modules/auth';
import { Link } from 'react-router';
import { getUrl } from 'pages';
import classNames from 'classnames';
import { Button } from 'components/Button';
import SvgIcon from 'components/SvgIcon';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import Input from 'components/HookForm/Input';
import { Checkbox, Box, Typography, Grid } from '@castlery/fortress';
import { EVENT_SIGN_UP } from 'utils/track/constants';
import { useFrame } from 'hooks/frame';
import { passwordChecker } from '@castlery/fortress/HookForm';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { phIdentify } from 'utils/posthog';
import {
  enableAlert,
  enablePrivacyPolicy,
  enableSpecificPrivacyPolicy,
  enableTermsOfUse,
  countrySubscribeInitalStatus,
  enabledRemoveNameOfSignup,
} from 'config';
import lang from 'utils/lang';
import { encryptPassword } from 'utils/passwordEncryption';
import WrapClick from './components/WrapClick';
import Facebook from './Facebook';
import style from './style.scss';
import AppleSignIn from './AppleSignIn';
import Google from './Google';
import { useLastTermsVersion } from './hooks/terms';

const DEFAULT_FIRST_NAME = 'Castlery';
const DEFAULT_LAST_NAME = 'Customer';

const SignUp = ({ className, title, onSuccess, onLogIn, onCartLoaded, fromPDPBanner }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    mode: 'onBlur',
  });
  const { desktop } = useBreakpoints();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const client = new ApiClient();
  const dispatch = useDispatch();
  const frame = useFrame();
  const [isAgreeTerms, setIsAgreeTerms] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(countrySubscribeInitalStatus);

  const lastTermsVersion = useLastTermsVersion();

  const agreeTerms = useMemo(() => {
    if (!enableAlert) {
      return true;
    }
    if (isAgreeTerms) {
      return true;
    }
    return false;
  }, [isAgreeTerms]);

  const onLoginHanlde = async (result) => {
    if (onCartLoaded) {
      await login(result.access_token, result.user, true)(dispatch);
      onCartLoaded();
    } else if (onSuccess) {
      await login(result.access_token)(dispatch);
      onSuccess();
    }
    if (result.user) {
      dispatch({
        type: EVENT_SIGN_UP,
        result: {
          action: 'User Registration',
          user: result.user,
          method: fromPDPBanner ? 'castlery PDP Banner sign up' : 'castlery sign up',
          tokens: result?.access_token,
        },
      });
      console.log('phIdentify', result.user);
      phIdentify(result.user?.hashedEmail);
    }
    setProcessing(false);
  };

  const openConfirmation = () => {
    frame.openModal('confirmation', {
      type: 'warning',
      title: 'Terms of Use',
      description: 'Please check the box below to agree to our Terms of Use.',
      iconSize: 'small',
      align: 'center',
      titleStyle: {
        fontSize: '28px',
      },
      showCencelButton: false,
      confirmText: 'I Understand',
      onConfirm: () => {},
    });
  };

  const handleAgreeTerms = () => {
    if (agreeTerms) {
      return true;
    }
    // frame.openModal('response', { body: 'Please tick the box to agree to the terms and conditions.' });
    openConfirmation();
    return false;
  };
  const OnSubmit = async (formData) => {
    setProcessing(true);
    if (!handleAgreeTerms()) {
      setProcessing(false);
      return;
    }
    try {
      const data = {
        email: formData.email,
        password: encryptPassword(formData.password),
        subscribe: isSubscribe,
        version: 1,
        ...(enabledRemoveNameOfSignup
          ? {
              // When enabledRemoveNameOfSignup is true, 'Castlery Customer' is used as the default name.
              // https://app.clickup.com/t/86etkq014
              firstname: DEFAULT_FIRST_NAME,
              lastname: DEFAULT_LAST_NAME,
            }
          : {
              firstname: formData.firstname,
              lastname: formData.lastname,
            }),
      };
      const result = await client.post('/users', {
        data,
      });
      dispatch(
        updateUserTermsVersion({
          data: {
            terms_of_use_version: lastTermsVersion,
          },
          accessToken: result?.access_token?.access_token,
        })
      );
      onLoginHanlde(result);
    } catch (error) {
      setError(error.errors ? error.errors[0].detail : error);
      setProcessing(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
      }}
      className={classNames(style.signup, className)}
    >
      <h2 className={style.title}>Welcome</h2>

      <p className={style.desc}>
        {!desktop ? (
          'Log in or sign up for an account, and be updated every step of the way.'
        ) : (
          <>
            Log in or sign up for an account.
            <br />
            Furniture shopping is about to get exciting, and we wouldn’t want you to miss out on anything.
          </>
        )}
      </p>

      <div className={style.wrapper}>
        <div className={`${style.wrapper}__quickBtn`}>
          {desktop && <p>Quick Sign up</p>}
          <WrapClick
            onClick={(e) => {
              if (!handleAgreeTerms()) {
                e.stopPropagation();
              }
            }}
            checkBeforeClick={agreeTerms}
          >
            <Facebook
              textButton="Sign up with Facebook"
              onCartLoaded={onCartLoaded}
              onSuccess={onSuccess}
              agreeTerms={agreeTerms}
              beforeClick={(e) => {
                if (!handleAgreeTerms()) {
                  e.stopPropagation();
                }
              }}
            />
          </WrapClick>
          <WrapClick
            onClick={(e) => {
              if (!handleAgreeTerms()) {
                e.stopPropagation();
              }
            }}
            checkBeforeClick={agreeTerms}
          >
            <AppleSignIn text="Sign up with Apple" onCartLoaded={onCartLoaded} onSuccess={onSuccess} />
          </WrapClick>

          <WrapClick
            onClick={(e) => {
              if (!handleAgreeTerms()) {
                e.stopPropagation();
              }
            }}
            checkBeforeClick={agreeTerms}
          >
            <Google text="signup_with" onCartLoaded={onCartLoaded} onSuccess={onSuccess} />
          </WrapClick>
        </div>

        <div className={style.or}>
          <span>or</span>
        </div>

        <div className={`${style.wrapper}__form`}>
          <p>Sign up with Email</p>

          {error && <div className={style.error}>{error}</div>}

          <form onSubmit={handleSubmit(OnSubmit)}>
            {!enabledRemoveNameOfSignup && (
              <>
                <Input
                  label="firstname"
                  name="First Name"
                  type="text"
                  autoComplete="given-name"
                  isRequired
                  register={register}
                  maxLength={32}
                  errors={errors}
                />
                <Input
                  label="lastname"
                  name="Last Name"
                  type="text"
                  autoComplete="family-name"
                  isRequired
                  maxLength={32}
                  register={register}
                  errors={errors}
                />
              </>
            )}

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
              autoComplete="new-password"
              isRequired
              register={register}
              errors={errors}
              customValidate={passwordChecker}
            />
            <Input
              register={register}
              errors={errors}
              label="passwordConfirm"
              name="Confirm Password"
              autoComplete="new-password"
              type="password"
              shouldMatchThisValue={watch('password')}
            />
            <div className={style.submit}>
              <Button
                data-selenium="sign_up"
                text={title}
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
            Already have an account?{' '}
            <a onClick={onLogIn} role="button" tabIndex="0">
              Log in
            </a>
          </div>
        </div>
      </div>
      {enableTermsOfUse && (
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
            <Grid>
              <Checkbox
                checked={isAgreeTerms}
                size="sm"
                slotProps={{
                  checkbox: {
                    sx: {
                      marginTop: '0.125em',
                    },
                  },
                }}
                onChange={(e) => {
                  setIsAgreeTerms(e.target.checked);
                }}
              />
            </Grid>
            <Grid item xs>
              <Typography level="caption1" textColor="brand.charcoal.600" lineHeight="md" width="auto">
                By checking this box, I have read, understood, and agree to Castlery's{' '}
                <Link to={getUrl('terms-of-use')} target="_blank" rel="noopener">
                  Terms of Use.
                </Link>
              </Typography>
            </Grid>
          </Grid>

          <Grid
            sx={{
              mt: 1.5,
              width: {
                xs: '100%',
                md: '85%',
              },
            }}
            container
            wrap="nowrap"
            spacing={1}
          >
            <Grid>
              <Checkbox
                checked={isSubscribe}
                size="sm"
                slotProps={{
                  checkbox: {
                    sx: {
                      marginTop: '0.125em',
                    },
                  },
                }}
                label={
                  <Typography level="caption1" textColor="brand.charcoal.600" lineHeight="md">
                    Yes, I would like to receive marketing emails and special offers from Castlery.
                  </Typography>
                }
                onChange={(e) => {
                  setIsSubscribe(e.target.checked);
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )}
      {enablePrivacyPolicy && (
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
            {enableSpecificPrivacyPolicy && (
              <Grid>
                <Checkbox
                  checked={isAgreeTerms}
                  size="sm"
                  slotProps={{
                    checkbox: {
                      sx: {
                        marginTop: '0.125em',
                      },
                    },
                  }}
                  onChange={(e) => {
                    setIsAgreeTerms(e.target.checked);
                  }}
                />
              </Grid>
            )}
            {enableSpecificPrivacyPolicy ? (
              <Grid item xs>
                <Typography level="caption1" textColor="brand.charcoal.600" lineHeight="md" width="auto">
                  By signing up, I have read, understood and agree to Castlery's{' '}
                  <Link to={getUrl('terms-of-use')} target="_blank" rel="noopener">
                    Terms of Use
                  </Link>{' '}
                  and{' '}
                  <Link to={getUrl('privacy-policy')} target="_blank" rel="noopener">
                    Privacy Policy.
                  </Link>
                </Typography>
              </Grid>
            ) : (
              <Grid item xs>
                <Typography level="caption1" textColor="brand.charcoal.600" lineHeight="md" width="auto">
                  By signing up, you have read, understood, and agree to Castlery's{' '}
                  <Link to={getUrl('terms-of-use')} target="_blank" rel="noopener">
                    Terms of Use
                  </Link>{' '}
                  and{' '}
                  <Link to={getUrl('privacy-policy')} target="_blank" rel="noopener">
                    Privacy Policy
                  </Link>
                  . You will be opted in to our newsletters, and can unsubscribe anytime.
                </Typography>
              </Grid>
            )}
          </Grid>

          <Grid
            sx={{
              mt: 1.5,
              width: {
                xs: '100%',
                md: '85%',
              },
            }}
            container
            wrap="nowrap"
            spacing={1}
          >
            <Grid>
              <Checkbox
                checked={isSubscribe}
                size="sm"
                slotProps={{
                  checkbox: {
                    sx: {
                      marginTop: '0.125em',
                    },
                  },
                }}
                label={
                  <Typography level="caption1" textColor="brand.charcoal.600" lineHeight="md">
                    {lang.t('pages.signup.subscribe')}
                  </Typography>
                }
                onChange={(e) => {
                  setIsSubscribe(e.target.checked);
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

SignUp.propTypes = {
  onLogIn: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  onCartLoaded: PropTypes.func,
  className: PropTypes.string,
  title: PropTypes.string,
};
SignUp.defaultProps = {
  title: 'Sign up',
};

export default SignUp;
