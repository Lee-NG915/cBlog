import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withFormsy, propTypes as formsyTypes } from 'formsy-react';
import classNames from 'classnames';
import style from './style.scss';

class FloatTextarea extends Component {
  static propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string,
    autoCapitalize: PropTypes.string,
    autoCorrect: PropTypes.string,
    className: PropTypes.string,
    refPassed: PropTypes.func,
    disabled: PropTypes.bool,
    maxLength: PropTypes.string,
    rows: PropTypes.string,
    showWordcount: PropTypes.bool,
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

  componentDidMount() {
    this.syncHeight();
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

  componentDidUpdate(prevProps, prevState) {
    const { value, focus } = this.state;
    const { value: propValue } = this.props;
    const prevValue = !prevState.focus ? prevProps.value || '' : prevState.value;
    const newValue = !focus ? propValue || '' : value;
    if (prevValue !== newValue) {
      this.syncHeight();
    }
  }

  syncHeight = () => {
    const height = this.shadow.scrollHeight;
    this.setState({
      height,
    });
  };

  changeValue = (e) => {
    const { focus } = this.state;
    const { setValue } = this.props;
    const { value } = e.currentTarget;
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
    const {
      value,
      showRequired,
      isPristine,
      showError,
      errorMessage,
      placeholder,
      name,
      maxLength,
      rows,
      autoCorrect,
      autoCapitalize,
      className,
      refPassed,
      disabled,
      showWordcount,
    } = this.props;
    const { focus, value: stateValue, height } = this.state;

    // whether we should indicate there's an error
    const isRequiredEmpty = showRequired && !isPristine;
    const hasError = isRequiredEmpty || (!showRequired && showError);
    const errMsg = (isRequiredEmpty && 'This field is mandatory') || errorMessage;

    return (
      <div
        className={classNames(
          style.floatTextarea,
          style.float,
          className,
          { 'is-active': focus || value },
          { 'has-error': hasError }
        )}
      >
        <textarea
          aria-hidden="true"
          ref={(c) => (this.shadow = c)}
          tabIndex="-1"
          rows={rows}
          readOnly
          maxLength={maxLength}
          disabled={!!disabled}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          value={!focus ? value || '' : stateValue}
        />
        <textarea
          id={name}
          ref={(c) => {
            // eslint-disable-next-line react/no-unused-class-component-methods
            this.input = c;
            if (refPassed) {
              refPassed(c);
            }
          }}
          style={{
            height: height ? `${height}px` : 'auto',
            paddingTop: '10px',
          }}
          name={name}
          className="form-control"
          onChange={this.changeValue}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
          value={!focus ? value || '' : stateValue}
          maxLength={maxLength}
          rows={rows}
          disabled={!!disabled}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        <label htmlFor={name}>{placeholder}</label>
        <div className={`${style.float}__error`}>{errMsg}</div>
        {showWordcount && (
          <div className={`${style.floatTextarea}__wordcount`}>Char {stateValue ? stateValue.length : 0}/300</div>
        )}
      </div>
    );
  }
}

export default withFormsy(FloatTextarea);
