import React from 'react';
import PropTypes from 'prop-types';
import config from 'config';
import { postcodeValidator, postcodeValidatorExistsForCountry } from 'postcode-validator';
import style from './style.scss';

const Input = ({
  label, // for hook form register
  name, // for display and placeholder
  register,
  type = 'text',
  isRequired = true,
  minLength,
  maxLength = 256,
  errors = {},
  autoComplete = 'on',
  disabled = false,
  readOnly = false,
  setValue,
  shouldMatchThisValue,
  customValidate,
}) => {
  const validation = {};
  if (isRequired) {
    validation.required = {
      value: true,
      message: `This field is mandatory`,
    };
  }
  if (minLength) {
    validation.minLength = {
      value: minLength,
      message: `${name} must be at least ${minLength} characters`,
    };
  }
  if (maxLength) {
    validation.maxLength = {
      value: maxLength,
      message: `${name} must be at most ${maxLength} characters`,
    };
  }
  if (type === 'email') {
    validation.pattern = {
      value: config.emailRegExp,
      message: `Please enter a valid email address`,
    };
  }
  if (type === 'tel') {
    validation.pattern = {
      value: config.phoneRegExp,
      message: `Please enter a valid phone number`,
    };
  }
  if (autoComplete === 'postal-code') {
    validation.validate = (v) => {
      if (v) {
        const formattedZipcode = config.regionalZipcodeFormatForValidate(v);

        if (config.addressFormFeature.useThirdPartyZipcodeValidator) {
          return postcodeValidatorExistsForCountry(__COUNTRY__) && postcodeValidator(formattedZipcode, __COUNTRY__)
            ? null
            : config.addressFormFeature.zipcodeValidErrorMsg;
        }
        return config.postalCodeRegExp.test(formattedZipcode) ? null : config.addressFormFeature.zipcodeValidErrorMsg;
      }
      return null;
    };
  }
  if (shouldMatchThisValue) {
    validation.validate = (v) => v === shouldMatchThisValue || 'The passwords do not match';
  }

  if (customValidate && typeof customValidate === 'function') {
    validation.validate = customValidate;
  }

  function formatUSPhoneNumber(phoneNumberString) {
    if (typeof config.phoneNumberFormatUtil === 'function') {
      return config.phoneNumberFormatUtil(phoneNumberString) || phoneNumberString;
    }
    return phoneNumberString;
  }

  function formatZipcode(zipcodeString) {
    if (typeof config.zipcodeFormatUtil === 'function') {
      return config.zipcodeFormatUtil(zipcodeString) || zipcodeString;
    }
    return zipcodeString;
  }

  return (
    <div className={style.inputContainer}>
      <input
        {...register(label, validation)}
        autoComplete={autoComplete}
        placeholder={name}
        type={type}
        disabled={disabled}
        readOnly={readOnly}
        autoCorrect="off"
        aria-invalid={errors[label] ? 'true' : 'false'}
        onKeyUp={(e) => {
          if (type === 'tel' && setValue && formatUSPhoneNumber(e.target.value)) {
            setValue(label, formatUSPhoneNumber(e.target.value), {
              shouldValidate: true,
            });
          }
          if (autoComplete === 'postal-code' && setValue && formatZipcode(e.target.value)) {
            setValue(label, formatZipcode(e.target.value), {
              shouldValidate: true,
            });
          }
        }}
      />
      <label htmlFor={label}>{name}</label>
      {errors[label] && <span role="alert">{errors[label].message}</span>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  register: PropTypes.func,
  type: PropTypes.string,
  isRequired: PropTypes.bool,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  pattern: PropTypes.object,
  errors: PropTypes.object,
  autoComplete: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  setValue: PropTypes.func,
  shouldMatchThisValue: PropTypes.string,
};

export default Input;
