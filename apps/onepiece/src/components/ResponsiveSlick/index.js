import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Slick from 'react-slick';
import classNames from 'classnames';
import { PrevBtn, NextBtn } from 'components/DesktopSlideButton';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

@withUseBreakpoints
export default class ResponsiveSlick extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]).isRequired,
    mediaQueries: PropTypes.array,
    className: PropTypes.string,
    trackClick: PropTypes.func,
    offset: PropTypes.number,
    breakpoints: PropTypes.object,
    isUsedInProductMaterial: PropTypes.bool,
    fixedWidthChange: PropTypes.bool,
  };

  static defaultProps = {
    mediaQueries: [
      {
        query: '(min-width: 0)',
        numPerPage: 1,
      },
    ],
    offset: 0.4,
  };

  listenersByQuery = [];

  constructor(props) {
    super(props);
    const { breakpoints = {} } = props;
    const { desktop } = breakpoints;
    this.state = {
      numPerPage: !desktop
        ? props.mediaQueries[0].numPerPage
        : props.mediaQueries[props.mediaQueries.length - 1].numPerPage,
    };
  }

  componentDidMount() {
    this.setMediaQuery();
  }

  componentWillUnmount() {
    this.listenersByQuery.forEach((l) => l());
  }

  setMediaQuery() {
    // set number of items per slide based on different resolution
    const { mediaQueries } = this.props;

    mediaQueries.forEach((mediaQuery) => {
      const mql = window.matchMedia(mediaQuery.query);
      const listener = (mq) => {
        if (mq.matches) {
          this.setState({
            numPerPage: mediaQuery.numPerPage,
          });
        }
      };
      mql.addListener(listener);
      this.listenersByQuery.push(() => {
        mql.removeListener(listener);
      });
      listener(mql);
    });
  }

  render() {
    const {
      children,
      className,
      trackClick,
      offset,
      breakpoints = {},
      isUsedInProductMaterial = false,
      fixedWidthChange,
    } = this.props;
    const { desktop } = breakpoints;
    const { numPerPage } = this.state;

    if (!desktop) {
      const childrenArr = React.Children.map(children, (c) =>
        React.cloneElement(c, {
          style: {
            width: children.length > numPerPage ? `${100 / (numPerPage + offset)}%` : `${100 / numPerPage}%`,
          },
        })
      );
      return <div className={classNames(style.slick, className)}>{childrenArr}</div>;
    }
    const childrenArr = React.Children.map(children, (c) =>
      React.cloneElement(c, {
        style: {
          width: `${100 / numPerPage}%`,
        },
      })
    );
    const group = [];

    for (let i = 0; i < childrenArr.length; i += numPerPage) {
      group.push(childrenArr.slice(i, i + numPerPage));
    }

    return (
      <div
        className={classNames(style.slick, className, {
          'is-onepage': children.length <= numPerPage,
        })}
      >
        <Slick
          infinite={!isUsedInProductMaterial}
          draggable={false}
          speed={300}
          dots={false}
          arrows
          prevArrow={<PrevBtn fixedWidthChange={fixedWidthChange} trackClick={trackClick} />}
          nextArrow={<NextBtn fixedWidthChange={fixedWidthChange} trackClick={trackClick} />}
        >
          {group.map((g, index) => (
            <React.Fragment key={index}>{g}</React.Fragment>
          ))}
        </Slick>
      </div>
    );
  }
}
