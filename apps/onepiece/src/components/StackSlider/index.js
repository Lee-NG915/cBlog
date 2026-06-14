import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TransitionMotion, spring } from 'react-motion';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import style from './style.scss';

export default class StackSlider extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]).isRequired,
    numOfStacks: PropTypes.number,
    buffer: PropTypes.number,
    distance: PropTypes.number, // px distance of each stack
    className: PropTypes.string,
  };

  static defaultProps = {
    numOfStacks: 3,
    buffer: 2,
    distance: 10,
  };

  state = {
    top: 0,
    direction: 1, // 1 means next, -1 means prev
  };

  willEnter = () => {
    const { numOfStacks, distance, buffer } = this.props;
    const { direction } = this.state;

    if (direction > 0) {
      return {
        x: distance * (numOfStacks - 1),
        y: -distance * (numOfStacks - 1),
        opacity: 0,
        zIndex: -buffer,
        boxShadow: 0,
      };
    }
    return {
      x: -30,
      y: 30,
      opacity: 0,
      zIndex: numOfStacks - 1,
      boxShadow: distance / 2,
    };
  };

  willLeave = () => {
    const { numOfStacks, distance } = this.props;
    const { direction } = this.state;

    if (direction > 0) {
      return {
        x: spring(-30),
        y: spring(30),
        opacity: spring(0),
        zIndex: numOfStacks,
        boxShadow: distance / 2,
      };
    }
  };

  slide = (num) => {
    const { children } = this.props;
    const { top } = this.state;
    const length = children.length || 1;
    this.setState({
      top: (top + length + num) % length,
      direction: num,
    });
  };

  render() {
    const { children, className, numOfStacks, buffer, distance } = this.props;
    const { top } = this.state;

    const num = numOfStacks + buffer;

    const childrenArr = React.Children.toArray(children).map((c, index) => ({
      key: `${index}`,
      data: c,
    }));

    const renderedChildren = [...childrenArr, ...childrenArr].slice(top, top + num);

    return (
      <TransitionMotion
        willEnter={this.willEnter}
        willLeave={this.willLeave}
        styles={renderedChildren.map((c, index) => ({
          ...c,
          style: {
            x: spring(distance * (index >= numOfStacks ? numOfStacks - 1 : index)),
            y: spring(-distance * (index >= numOfStacks ? numOfStacks - 1 : index)),
            opacity: spring(index >= numOfStacks ? 0 : 1),
            zIndex: numOfStacks - (index + 1),
            boxShadow: spring(index >= numOfStacks - 1 ? 0 : distance / 2),
          },
        }))}
      >
        {(interpolatedStyles) => (
          <div className={classNames(className, style.wrapper)}>
            {interpolatedStyles.map((config) => (
              <div
                className={style.item}
                key={config.key}
                style={{
                  transform: `translate3d(${config.style.x}px, ${config.style.y}px, 0)`,
                  WebkitTransform: `translate3d(${config.style.x}px, ${config.style.y}px, 0)`,
                  opacity: config.style.opacity,
                  zIndex: config.style.zIndex,
                  boxShadow:
                    `${config.style.boxShadow}px -${config.style.boxShadow}px ` +
                    `${2 * config.style.boxShadow}px rgba(0,0,0,0.2)`,
                }}
              >
                {config.data}
              </div>
            ))}
            {childrenArr.length > 1 && (
              <button
                style={{ left: -10 }}
                type="button"
                onClick={() => this.slide(-1)}
                className={`${style.nav} ${style.nav}--prev btn`}
              >
                <ReactSVG name="arrow-prev" />
              </button>
            )}
            {childrenArr.length > 1 && (
              <button
                style={{ right: -distance * (numOfStacks - 1) - 10 }}
                type="button"
                onClick={() => this.slide(1)}
                className={`${style.nav} ${style.nav}--next btn`}
              >
                <ReactSVG name="arrow-next" />
              </button>
            )}
          </div>
        )}
      </TransitionMotion>
    );
  }
}
