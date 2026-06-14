// if want to use in Formsy, need a withFormsy.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import style from './style.scss';

export default class Rating extends Component {
  static propTypes = {
    rating: PropTypes.number,
    onChange: PropTypes.func,
    className: PropTypes.string,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      rating: props.rating || 0,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { rating } = this.props;
    if (nextProps.rating !== rating) {
      this.setState({
        rating: nextProps.rating || 0,
      });
    }
  }

  onClick = (rating) => {
    const { onChange } = this.props;
    const { rating: stateRating } = this.state;
    if (stateRating !== rating) {
      this.setState({
        rating,
      });

      if (onChange) {
        onChange(rating);
      }
    }
  };

  render() {
    const { className, disabled } = this.props;
    const { rating } = this.state;

    return (
      <div className={classNames(style.rating, className)}>
        {[5, 4, 3, 2, 1].map((r) => (
          <button
            data-selenium={`Rating-star${r}`}
            disabled={disabled}
            key={r}
            type="button"
            onClick={() => this.onClick(r)}
            className={classNames('btn', {
              'is-active': r <= rating,
            })}
          >
            <ReactSVG name="star" />
          </button>
        ))}
      </div>
    );
  }
}
