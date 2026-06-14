/* eslint-disable react/no-unused-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './style.scss';

export default class LoadingBar extends Component {
  static propTypes = {
    className: PropTypes.string,
    percent: PropTypes.number.isRequired,
    onTop: PropTypes.bool,
    autoIncrement: PropTypes.bool,
    intervalTime: PropTypes.number,
  };

  static defaultProps = {
    percent: -1,
    onTop: false,
    autoIncrement: true,
    intervalTime: 80,
  };

  constructor(props) {
    super(props);

    this.state = {
      percent: props.percent,
    };
  }

  componentDidMount() {
    this.handleProps(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.clearTimer();
    this.handleProps(nextProps);
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  clearTimer = () => {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.timeout1) {
      clearTimeout(this.timeout1);
    }
    if (this.timeout2) {
      clearTimeout(this.timeout2);
    }
  };

  increment = () => {
    let { percent } = this.state;
    percent += Math.random() + 1 - Math.random();
    percent = percent < 99 ? percent : 99;
    this.setState({
      percent,
    });
  };

  handleProps = (props) => {
    if (props.autoIncrement && props.percent >= 0 && props.percent < 99) {
      this.interval = setInterval(this.increment, props.intervalTime);
    }

    if (props.percent >= 100) {
      // animation scale first
      this.setState(
        {
          percent: 99.9,
        },
        () => {
          // wait 100ms then animate opacity and visibility
          this.timeout1 = setTimeout(() => {
            this.setState({
              percent: 100,
            });
          }, 200);
          // reset scale to 0 in the end
          this.timeout2 = setTimeout(() => {
            this.setState({
              percent: -1,
            });
          }, 300);
        }
      );
    } else {
      this.setState({
        percent: props.percent,
      });
    }
  };

  render() {
    const { onTop, className } = this.props;
    const { percent } = this.state;

    const scaleX = (percent < 0 ? 0 : percent) / 100;
    const styles = {
      transform: `scale(${scaleX}, 1)`,
      WebkitTransform: `scale(${scaleX}, 1)`,
    };

    return (
      <div
        className={classNames(
          style.bar,
          className,
          { 'is-onTop': onTop },
          { 'is-hidden': percent < 0 || percent >= 100 }
        )}
      >
        <div style={styles} />
      </div>
    );
  }
}
