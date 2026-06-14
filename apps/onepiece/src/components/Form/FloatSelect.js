import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withFormsy, propTypes as formsyTypes } from 'formsy-react';
import classNames from 'classnames';
import Select from './Select';
import style from './style.scss';

class FloatSelect extends Component {
  static propTypes = {
    placeholder: PropTypes.string,
    className: PropTypes.string,
    options: PropTypes.object,
    name: PropTypes.string,
    disabled: PropTypes.bool,
    CustomOption: PropTypes.func, // custom option component
    // from withFormsy
    ...formsyTypes,
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  changeValue(e) {
    const { value } = e.currentTarget;
    this.setState({
      value,
      isSync: false,
    });
  }

  render() {
    const {
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
      CustomOption,
    } = this.props;

    // whether we should indicate there's an error
    const isRequiredEmpty = showRequired && !isPristine;
    const hasError = isRequiredEmpty || (!showRequired && showError);
    const errMsg = (isRequiredEmpty && 'This field is mandatory') || errorMessage;

    return (
      <div
        className={classNames(
          style.floatSelect,
          style.float,
          className,
          { 'is-active': value !== null },
          { 'has-error': hasError }
        )}
      >
        <Select
          className={`${style.floatSelect}__select`}
          options={options}
          name={name}
          value={value}
          onChange={setValue}
          disabled={!!disabled}
          CustomOption={CustomOption}
        />
        <label>{placeholder}</label>
        <div className={`${style.float}__error`}>{errMsg}</div>
      </div>
    );
  }
}

export default withFormsy(FloatSelect);
