import React from 'react';
import PropTypes from 'prop-types';
import { getUrl } from 'pages';
import { Link } from 'react-router';
import Input from 'components/Subscription/NewInput';
import classNames from 'classnames';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const LLTEmailForm = ({ handleSubmit, className, deleteItem }) => {
  const { desktop } = useBreakpoints();
  return (
    <div className={classNames(style.lltEmailForm, className)}>
      <Input
        type="LLT"
        className={`${style.lltEmailForm}__input`}
        btnColor="light-neutral"
        placeholder={desktop ? 'Enter Your Email Address' : 'Enter Email Address'}
        inputDataSelenium="llt_email"
        buttonDataSelenium="llt_subscribe"
        onSuccess={handleSubmit}
        deleteItem={deleteItem}
      />

      <div className={`${style.lltEmailForm}__terms`}>
        By entering your email above, you agree to our{' '}
        <Link to={getUrl('terms-of-use')} target="_blank" className={`${style.lltEmailForm}__termLink`}>
          Terms
        </Link>{' '}
        &amp;{' '}
        <Link to={getUrl('privacy-policy')} target="_blank" className={`${style.lltEmailForm}__termLink`}>
          Privacy Policy.
        </Link>{' '}
      </div>
    </div>
  );
};

LLTEmailForm.propTypes = {
  handleSubmit: PropTypes.func,
  className: PropTypes.string,
  deleteItem: PropTypes.object,
};

export default LLTEmailForm;
