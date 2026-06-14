import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withFormsy, propTypes as formsyTypes } from 'formsy-react';
import classNames from 'classnames';
import Cleave from 'cleave.js/react';
import style from './style.scss';

class PhoneNumberInput extends Component {
  static propTypes = {
    // type: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    autoCapitalize: PropTypes.string,
    autoCorrect: PropTypes.string,
    icon: PropTypes.object,
    className: PropTypes.string,
    // refPassed: PropTypes.func,
    // disabled: PropTypes.bool,
    maxLength: PropTypes.string,
    // formatter: PropTypes.func,
    options: PropTypes.object, // Cleave js need the options
    // from withFormsy
    ...formsyTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.value || '',
      focus: false,
    };

    this.oldValue = props.value || '';
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // keep update with parent
    const newValue = nextProps.value || '';
    if (newValue !== this.oldValue) {
      this.oldValue = newValue;
      this.setState({
        value: newValue,
      });
    }
  }

  changeValue = (e) => {
    this.setState({ value: e.target.rawValue });
  };

  onFocus = () => {
    this.setState({
      focus: true,
    });
  };

  onBlur = (e) => {
    const { setValue } = this.props;
    // use e.target.value instead of this.state.value to
    // prevent the bug on ios chrome not firing on change
    // event when autocomplete
    setValue(e.target.value);
    this.setState({
      focus: false,
    });
  };

  onKeyDown = (e) => {
    const { value } = this.state;
    const { setValue } = this.props;
    if (e.keyCode === 13) {
      setValue(value);
    }
  };

  render() {
    const {
      value,
      showRequired,
      isPristine,
      showError,
      errorMessage,
      placeholder,
      name,
      maxLength,
      icon,
      autoCorrect,
      autoCapitalize,
      className,
      options,
      newStyle,
    } = this.props;

    const { focus, value: stateValue } = this.state;

    // whether we should indicate there's an error
    const isRequiredEmpty = showRequired && !isPristine;
    const hasError = isRequiredEmpty || (!showRequired && showError);
    const errMsg = !isPristine && ((isRequiredEmpty && 'This field is mandatory') || errorMessage);

    if (newStyle) {
      return (
        <div
          className={classNames(style.input, className, {
            'has-error': hasError,
          })}
        >
          <Cleave
            options={options}
            name={name}
            className="form-control"
            onChange={this.changeValue}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onKeyDown={this.onKeyDown}
            value={!focus ? value || '' : stateValue}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            placeholder={placeholder}
          />
          <label htmlFor={name}>{placeholder}</label>
          {errMsg && <div className={`${style.input}__error`}>{errMsg}</div>}
        </div>
      );
    }
    return (
      <div
        className={classNames(
          style.floatInput,
          style.float,
          className,
          { 'is-active': focus || value },
          { 'has-error': hasError },
          { [`${style.floatInput}--icon`]: icon }
        )}
      >
        <Cleave
          options={options}
          name={name}
          className="form-control"
          onChange={this.changeValue}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
          value={!focus ? value || '' : stateValue}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        {icon}
        <label htmlFor={name}>{placeholder}</label>
        <div className={`${style.float}__error`}>{errMsg}</div>
      </div>
    );
  }
}

export default withFormsy(PhoneNumberInput);
