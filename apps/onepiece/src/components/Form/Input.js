import React from 'react';
import PropTypes from 'prop-types';
import { withFormsy, propTypes as formsyTypes } from 'formsy-react';
import classNames from 'classnames';
import style from './style.scss';

const Input = ({
  type,
  value,
  name,
  maxLength,
  forwardRef,
  placeholder,
  autoComplete,
  autoCorrect,
  autoCapitalize,
  className,
  disabled,
  setValue,
  showRequired,
  isPristine,
  showError,
  errorMessage,
}) => {
  const changeValue = (e) => {
    setValue(e.currentTarget.value);
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      setValue(e.target.value);
    }
  };

  const isRequiredEmpty = showRequired && !isPristine;
  const hasError = isRequiredEmpty || (!showRequired && showError);
  const errMsg = !isPristine && ((isRequiredEmpty && 'This field is mandatory') || errorMessage);

  return (
    <div className={classNames(style.input, className, { 'has-error': hasError })}>
      <input
        id={name}
        ref={forwardRef}
        type={type || 'text'}
        value={value}
        name={name}
        placeholder={placeholder}
        className="form-control"
        onChange={changeValue}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        disabled={!!disabled}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
      />
      <label htmlFor={name}>{placeholder}</label>
      {errMsg && <div className={`${style.input}__error`}>{errMsg}</div>}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  forwardRef: PropTypes.object,
  placeholder: PropTypes.string,
  autoCapitalize: PropTypes.string,
  autoCorrect: PropTypes.string,
  autoComplete: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  maxLength: PropTypes.string,

  // from withFormsy
  ...formsyTypes,
};

export default withFormsy(Input);
