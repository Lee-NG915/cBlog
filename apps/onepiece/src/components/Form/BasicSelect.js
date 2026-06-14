import React from 'react';
import PropTypes from 'prop-types';
import { withFormsy, propTypes as formsyTypes } from 'formsy-react';
import classNames from 'classnames';
import Select from './Select';
import style from './style.scss';

const BasicSelect = ({
  value,
  setValue,
  showRequired,
  isPristine,
  showError,
  errorMessage,
  placeholder,
  className,
  options,
  name,
  disabled,
}) => {
  const isRequiredEmpty = showRequired && !isPristine;
  const hasError = isRequiredEmpty || (!showRequired && showError);
  const errMsg = (isRequiredEmpty && 'This field is mandatory') || errorMessage;

  return (
    <div
      className={classNames(style.basicSelect, className, {
        'has-error': hasError,
      })}
    >
      <Select
        className={`${style.basicSelect}__select`}
        options={options}
        id={name}
        name={name}
        value={value}
        onChange={setValue}
        disabled={!!disabled}
      />
      <label htmlFor={name}>{placeholder}</label>
      {errMsg && <div className={`${style.basicSelect}__error`}>{errMsg}</div>}
    </div>
  );
};
BasicSelect.propTypes = {
  placeholder: PropTypes.string,
  className: PropTypes.string,
  options: PropTypes.object,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  // from withFormsy
  ...formsyTypes,
};

export default withFormsy(BasicSelect);
