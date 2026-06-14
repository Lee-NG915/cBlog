// if want to use in Formsy, need a withFormsy.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import PriceDisplay from 'components/PriceDisplay';
import style from './style.scss';

export default class Radio extends Component {
  static propTypes = {
    options: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), // {value: label}
    value: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
    type: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { value } = this.props;
    if (nextProps.value !== value) {
      this.setState({
        value: nextProps.value,
      });
    }
  }

  onClick = (value) => {
    const { value: stateValue } = this.state;
    const { onChange } = this.props;
    if (stateValue !== value) {
      this.setState({
        value,
      });

      if (onChange) {
        onChange(value);
      }
    }
  };

  render() {
    const { options, className, type } = this.props;
    const { value } = this.state;

    if (type === 'shipment_services' && Array.isArray(options)) {
      return (
        <div className={classNames(style.radio, className)}>
          {options.map((service) => (
            <button
              key={service.type}
              type="button"
              className={classNames('btn', {
                'is-selected': value === service.type,
              })}
              onClick={() => this.onClick(service.type)}
            >
              <div className={`${style.radio}__service`}>
                <div className={`${style.radio}__service-detail`}>
                  <h4 className={`${style.radio}__service-title`}>{service.display_name}</h4>
                  <div className={`${style.radio}__service-desc`}>{service.display_content}</div>
                </div>
                {service.type !== 'standard' && (
                  <div className={`${style.radio}__service-fee`}>
                    {enableDisplayOriginAmount && '+'}
                    <PriceDisplay price={service.amount} originalPrice={service.original_amount} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      );
    }
    return (
      <div className={classNames(style.radio, className)}>
        {Object.keys(options).map((key, index) => (
          <button
            key={index}
            type="button"
            className={classNames('btn', {
              'is-selected': value === key,
            })}
            onClick={() => this.onClick(key)}
          >
            {options[key]}
          </button>
        ))}
      </div>
    );
  }
}
