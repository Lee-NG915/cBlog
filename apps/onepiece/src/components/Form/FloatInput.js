import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withFormsy, propTypes as formsyTypes } from 'formsy-react';
import classNames from 'classnames';
import style from './style.scss';

class FloatInput extends Component {
  static propTypes = {
    type: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    autoCapitalize: PropTypes.string,
    autoCorrect: PropTypes.string,
    autoComplete: PropTypes.string,
    icon: PropTypes.object,
    className: PropTypes.string,
    refPassed: PropTypes.func,
    disabled: PropTypes.bool,
    maxLength: PropTypes.string,
    formatter: PropTypes.func,
    // from withFormsy
    ...formsyTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.value || '',
      focus: false,
    };

    // to track old value because value is not reliable
    this.oldValue = props.value || '';
  }

  // state = {
  //   value: this.props.value || '',
  //   focus: false,
  // };

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
    const { focus } = this.state;
    const { formatter, setValue } = this.props;
    let { value } = e.currentTarget;
    if (formatter) {
      value = formatter(value);
    }

    if (focus) {
      this.setState({
        value,
      });
    } else {
      setValue(value);
    }
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
    const { focus, value: stateValue } = this.state;
    const {
      value,
      showRequired,
      isPristine,
      showError,
      errorMessage,
      placeholder,
      type,
      name,
      maxLength,
      icon,
      autoComplete,
      autoCorrect,
      autoCapitalize,
      className,
      refPassed,
      disabled,
    } = this.props;

    // whether we should indicate there's an error
    const isRequiredEmpty = showRequired && !isPristine;
    const hasError = isRequiredEmpty || (!showRequired && showError);
    const errMsg = (isRequiredEmpty && 'This field is mandatory') || errorMessage;

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
        <input
          id={name}
          ref={(c) => {
            // eslint-disable-next-line react/no-unused-class-component-methods
            this.input = c;
            if (refPassed) {
              refPassed(c);
            }
          }}
          type={type || 'text'}
          name={name}
          className="form-control"
          onChange={this.changeValue}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
          value={!focus ? value || '' : stateValue}
          maxLength={maxLength}
          disabled={!!disabled}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
        />
        {icon}
        <label htmlFor={name} dangerouslySetInnerHTML={{ __html: placeholder }} />
        {hasError && <div className={`${style.float}__error`}>{errMsg}</div>}
      </div>
    );
  }
}

export default withFormsy(FloatInput);
