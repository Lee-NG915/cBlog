import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Motion, spring } from 'react-motion';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

@withUseBreakpoints
export default class Slider extends Component {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.array.isRequired,
    breakpoints: PropTypes.object,
  };

  state = {
    x: 0,
    index: 0,
  };

  componentDidMount() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (desktop) {
      // calculate initial index
      // we assume all children are equal size
      const parentWidth = this.container.clientWidth;

      // to review @kanqiang
      let childWidth = 0;
      if (typeof this.container.children[0] !== 'undefined') {
        childWidth = this.container.children[0].offsetWidth;
      }

      const numPerPage = Math.round(parentWidth / childWidth);

      this.setState({
        childWidth,
        numPerPage,
      });
    }
  }

  next() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (desktop) {
      const { index, numPerPage, x, childWidth } = this.state;
      const { children } = this.props;

      if (index + numPerPage < children.length) {
        this.setState({
          x: x - childWidth,
          index: index + 1,
        });
      }
    }
  }

  prev() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (desktop) {
      const { index, x, childWidth } = this.state;

      if (index > 0) {
        this.setState({
          x: x + childWidth,
          index: index - 1,
        });
      }
    }
  }

  render() {
    const { children, className, breakpoints = {} } = this.props;
    const { index, numPerPage, x } = this.state;
    const { desktop } = breakpoints;
    return (
      <div className={classNames(className, style.slider)}>
        <div className={`${style.slider}__outer`}>
          {desktop ? (
            <Motion
              style={{
                x: spring(x, { stiffness: 180, damping: 26 }),
              }}
            >
              {({ x }) => (
                <div
                  ref={(c) => (this.container = c)}
                  className={`${style.slider}__inner`}
                  style={{
                    WebkitTransform: `translate3d(${x}px, 0, 0)`,
                    transform: `translate3d(${x}px, 0, 0)`,
                  }}
                >
                  {children}
                </div>
              )}
            </Motion>
          ) : (
            children
          )}
        </div>
        {desktop && index > 0 && (
          <button type="button" className={`${style.slider}__prev btn`} onClick={this.prev.bind(this)}>
            <ReactSVG name="arrow-prev" />
          </button>
        )}
        {desktop && index + numPerPage < children.length && (
          <button type="button" className={`${style.slider}__next btn`} onClick={this.next.bind(this)}>
            <ReactSVG name="arrow-next" />
          </button>
        )}
      </div>
    );
  }
}
