import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import classNames from 'classnames';
import { Button } from 'components/Button';
import SvgIcon from 'components/SvgIcon';
import { useForm } from 'react-hook-form';
import Input from 'components/HookForm/Input';
import { enableO2O } from 'config';
import style from './style.scss';

const ResetPass = ({ className, onLogIn }, { router }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
  });
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [sent, setSent] = useState(''); // store email
  const client = new ApiClient();
  const { from_email: fromEmail, email } = router?.location?.query || {};

  const onSubmit = async (formData) => {
    setProcessing(true);
    const inputEmail = formData?.email;
    const isFromPosEmail = enableO2O && fromEmail === 'true' && email === inputEmail;
    try {
      await client.post('/users/recover_password', {
        data: {
          email: inputEmail,
          from_email: isFromPosEmail,
        },
      });
      setSent(inputEmail);
      setProcessing(false);
    } catch (error) {
      if (error?.errors?.[0]?.code === 429) {
        const errMsg = 'Too many requests have been made. Please try again later.';
        setError(errMsg);
      } else {
        const errMsg = error?.errors[0]?.detail || 'Oops, something went wrong. Please try again later.';
        setError(errMsg);
      }
      setProcessing(false);
    }
  };

  return (
    <div className={classNames(style.resetPass, className)}>
      <h2 className={style.title}>Reset Password</h2>
      {!sent ? (
        <div>
          <p className={style.desc}>
            Enter the email address associated with your account, and we’ll email you a link to reset your password.
          </p>

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
            <div className={`${style.submit} ${style.submit}__isReset`}>
              <Button
                data-selenium="sign_up"
                text="Send Reset Link"
                type="submit"
                loading={processing}
                disabled={processing}
                width="100%"
                size="medium"
                rightIcon={<SvgIcon name="line-right-arrow" width={24} />}
              />
            </div>
          </form>
        </div>
      ) : (
        <div className={`${style.resetPass}__success`}>
          <p>
            A link to reset your password has been sent to <strong>{sent}</strong>
          </p>
        </div>
      )}
      <div
        className={classNames(style.footer, {
          'is-success': !!sent,
        })}
      >
        Back to{' '}
        <a onClick={onLogIn} role="button" tabIndex="0">
          Log in
        </a>
      </div>
    </div>
  );
};

ResetPass.propTypes = {
  onLogIn: PropTypes.func.isRequired,
  className: PropTypes.string,
};
ResetPass.contextTypes = {
  router: PropTypes.object,
};

export default ResetPass;
