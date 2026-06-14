import React from 'react';
import PropTypes from 'prop-types';
import Cleave from 'cleave.js/react';
import classNames from 'classnames';

import style from './style.scss';

export default class Input extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.string,
    isValid: PropTypes.bool,
    options: PropTypes.object, // use cleave if options exist
  };

  static defaultProps = {
    isValid: false,
    error: '',
  };

  onChangeRaw = (event) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(event.target.rawValue);
    }
  };

  onChange = (event) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(event.target.value);
    }
  };

  render() {
    const { onChange, options, className, error, isValid, ...rest } = this.props;

    return (
      <div className={classNames(style.input, className, { 'has-error': error }, { 'is-valid': isValid })}>
        {options ? (
          <Cleave className="form-control" options={options} onChange={this.onChangeRaw} {...rest} />
        ) : (
          <input className="form-control" onChange={this.onChange} {...rest} />
        )}
        <p>{error}</p>
      </div>
    );
  }
}
