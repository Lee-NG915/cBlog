/**
 *
 * Component to render a banner.
 *
 * Basic usage:
 *  <Banner
 *    mediaQueries={[
 *      {
 *        breakpoint: 'xs',
 *        srcset: '/v1501059579/static/feat/krystian_kowalski_mobile_bg.jpg',
 *        loader: { ratio: 0.9296875 },
 *      },
 *      {
 *        breakpoint: 'lg',
 *        srcset: '/v1501041578/static/feat/krystian_kowalski_bg.jpg',
 *        loader: { ratio: 0.667361 },
 *      }
 *    ]}
 *    title="image alt"
 *    link={getUrl('about-us')}
 *  >
 *    <div />
 *  </Banner>
 *
 *  mediaQueries is passed to ReactPicture. If src or srcset is an array, then render a
 *  banner slider.
 */

import React from 'react';
import PropTypes from 'prop-types';
import ReactPicture from 'components/ReactPicture';
import { cloudinaryRoot } from 'config';
import { getBreakpoint } from 'utils/breakpoints';
import classNames from 'classnames';
import { Link } from 'react-router';
import Slick from 'react-slick';
import { ColorPalette } from 'utils/color';

import { withUseBreakpoints } from 'utils/page';
import { Container } from '@castlery/fortress';
import style from './style.scss';

@withUseBreakpoints
class Banner extends React.Component {
  static propTypes = {
    mediaQueries: PropTypes.array.isRequired, // [{breakpoint, src/srcset, loader}]
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
    style: PropTypes.object,
    lazy: PropTypes.bool,
    link: PropTypes.string,
    setImagePreloaderOnServer: PropTypes.bool,
    backgroundColor: PropTypes.string,
    type: PropTypes.string,
    showMask: PropTypes.bool,
    breakpoints: PropTypes.object,
  };

  static defaultProps = {
    lazy: true,
  };

  listenersByQuery = [];

  constructor(props) {
    super(props);

    const { breakpoints } = props;
    const { desktop: isDesktop } = breakpoints;
    this.state = {
      index: !isDesktop ? 0 : props.mediaQueries.length - 1,
    };
  }

  componentDidMount() {
    this.updatMediaQuery(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { breakpoints } = nextProps;
    const { breakpoints: _breakpoints } = this.props;
    if (breakpoints?.desktop !== _breakpoints?.desktop) {
      this.updatMediaQuery(nextProps);
    }
  }

  componentWillUnmount() {
    this.listenersByQuery.forEach((l) => l());
  }

  setMediaQuery() {
    const { mediaQueries: _mediaQueries } = this.props;

    // set number of items per slide based on different resolution
    const mediaQueries = _mediaQueries.map(
      (m, index) =>
        `(min-width: ${getBreakpoint(m.breakpoint, 'min')}px)${
          index < _mediaQueries.length - 1
            ? ` and (max-width: ${getBreakpoint(_mediaQueries[index + 1].breakpoint, 'min') - 1}px)`
            : ''
        }`
    );
    mediaQueries.forEach((mediaQuery, index) => {
      const mql = window.matchMedia(mediaQuery);
      const listener = (mq) => {
        if (mq.matches) {
          this.setState({
            index,
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

  disableMediaQuery() {
    this.listenersByQuery?.forEach((l) => l());
    this.listenersByQuery = [];
  }

  updatMediaQuery(props) {
    const { breakpoints = {}, mediaQueries = [] } = props;
    const { desktop } = breakpoints;
    if (!desktop) {
      this.setState({
        index: 0,
      });
      this.setMediaQuery();
    } else {
      this.setState({
        index: mediaQueries.length - 1 || 0,
      });
      this.disableMediaQuery();
    }
  }

  render() {
    const { index } = this.state;
    const {
      mediaQueries,
      title,
      children,
      className,
      style: _style,
      link,
      backgroundColor,
      type,
      showMask,
      breakpoints,
      ...otherProps
    } = this.props;

    const { desktop: isDesktop } = breakpoints;

    const mediaQuery = mediaQueries[index];
    let src;
    let srcset;
    let images = [];
    if (mediaQuery.src) {
      if (!Array.isArray(mediaQuery.src)) {
        src = [mediaQuery.src];
      } else {
        src = mediaQuery.src;
      }

      images = src.map((s) => {
        let _src;
        if (/^https?:\/\//.test(s)) {
          _src = s;
        } else {
          _src = `${cloudinaryRoot}${s}`;
        }

        return (
          <ReactPicture
            key={s}
            src={_src}
            className={classNames(`${style.banner}__image`, {
              'has-mask': showMask,
            })}
            alt={title}
            loader={mediaQuery.loader}
            {...otherProps}
          />
        );
      });
    } else if (mediaQuery.srcset) {
      if (!Array.isArray(mediaQuery.srcset)) {
        srcset = [mediaQuery.srcset];
      } else {
        srcset = mediaQuery.srcset;
      }
      images = srcset.map((s) => {
        let _srcset;
        if (/^https?:\/\//.test(s)) {
          _srcset = s;
        } else {
          _srcset = `${cloudinaryRoot}${s}`;
        }

        return (
          <ReactPicture
            key={s}
            srcset={_srcset}
            className={classNames(`${style.banner}__image`, {
              'has-mask': showMask,
            })}
            alt={title}
            loader={{
              widths: !isDesktop ? [640, 960, 1280, 1440, 1920] : [960, 1280, 1440, 1920, 2880],
              ...mediaQuery.loader,
            }}
            type={type}
            bgColor={backgroundColor}
            {...otherProps}
          />
        );
      });
    } else {
      // no src or srcset
      images = [
        <ReactPicture
          key="no-image"
          loader={{ ...mediaQuery.loader }}
          bgColor={backgroundColor || ColorPalette.complimentary}
        />,
      ];
    }

    let image;
    if (images.length > 1) {
      image = (
        <Slick infinite draggable={false} speed={300} dots arrows={false} className={`${style.banner}__slick`}>
          {images}
        </Slick>
      );
    } else {
      [image] = images;
    }

    if (link) {
      image = <Link to={link}>{image}</Link>;
    }

    return (
      <Container disableGutters className={classNames(`${style.banner}`, className)} style={_style}>
        {image}
        {children}
      </Container>
    );
  }
}

export default Banner;
