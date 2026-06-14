import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import ReactPicture from 'components/ReactPicture';
import ReactSVG from 'components/ReactSVG';
import classNames from 'classnames';
import { withUseBreakpoints } from 'utils/page';
import { getUserDevice } from 'utils/device';
import style from './style.scss';

const device = getUserDevice();
@withUseBreakpoints
export default class View360 extends Component {
  static propTypes = {
    variant: PropTypes.object,
    pointerDownHandler: PropTypes.func,
    pointerUpHandler: PropTypes.func,
    index: PropTypes.number,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  static defaultProps = {
    variant: {},
    index: -1,
  };

  state = {
    index: 0,
    delta: 0,
    images: null,
    loading: true,
  };

  client = new ApiClient();

  POINTER_DOWN = device === 'desktop' ? 'mousedown' : 'touchstart';

  POINTER_MOVE = device === 'desktop' ? 'mousemove' : 'touchmove';

  POINTER_UP = device === 'desktop' ? 'mouseup' : 'touchend';

  DISTANCE = device === 'desktop' ? 30 : 15;

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.loadImages();
    this.image.addEventListener(this.POINTER_DOWN, this.handleMouseDown);
  }

  componentDidUpdate(prevProps) {
    const { variant } = this.props;
    if (prevProps.variant.id !== variant.id) {
      this.loadImages();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleMouseDown = (e) => {
    const { loading } = this.state;
    const { pointerDownHandler } = this.props;
    if (loading) {
      return;
    }

    if (pointerDownHandler && typeof pointerDownHandler === 'function') {
      pointerDownHandler();
    }

    if (device === 'desktop') {
      this.x = e.clientX;
    } else {
      this.x = e.touches[0].clientX;
    }

    window.addEventListener(this.POINTER_UP, this.handleMouseUp);
    window.addEventListener(this.POINTER_MOVE, this.handleMouseMove, {
      passive: false,
    });
  };

  handleMouseUp = () => {
    const { pointerUpHandler } = this.props;
    this.setState({
      index: this.getIndex(),
      delta: 0,
    });

    if (pointerUpHandler && typeof pointerUpHandler === 'function') {
      pointerUpHandler();
    }

    window.removeEventListener(this.POINTER_UP, this.handleMouseUp);
    window.removeEventListener(this.POINTER_MOVE, this.handleMouseMove);
  };

  handleMouseMove = (e) => {
    const { images } = this.state;
    const num = images.length;

    // https://bugs.webkit.org/show_bug.cgi?id=184250
    // so e.preventDefault() won't work on ios until fixed

    let x;
    if (device === 'desktop') {
      x = e.clientX;
    } else {
      x = e.touches[0].clientX;
    }
    const n = Math.trunc((x - this.x) / this.DISTANCE) % num;
    this.setState({
      delta: n,
    });
  };

  getIndex() {
    const { images, index, delta } = this.state;
    const num = images.length;

    return (index - delta + num) % num;
  }

  loadImages() {
    const { variant } = this.props;
    const images = variant.threed_images || [];

    this.setState({
      loading: true,
      images,
    });

    this.promises = [];
    const requests = images.map(
      () =>
        new Promise((resolve) => {
          this.promises.push(resolve);
        })
    );

    Promise.all(requests)
      .then(() => {
        if (this._isMounted) {
          this.setState({
            loading: false,
          });
        }
      })
      .catch((error) => console.error(JSON.stringify({ message: 'View360 error', error }, null, 2)));
  }

  render() {
    const { variant, breakpoints = {} } = this.props;
    const { images, loading } = this.state;
    const { desktop } = breakpoints;

    return (
      <div className={classNames(style.view360, { 'is-loading': loading })} ref={(c) => (this.image = c)}>
        {images && (
          <div className={`${style.view360}__images`}>
            {images.map((image, i) => (
              <ReactPicture
                onLoad={() => this.promises[i].call()}
                className={i === this.getIndex() ? 'is-active' : ''}
                key={image.id}
                srcset={image.links}
                alt={`${variant.name} ${i}`}
                loader={{
                  ratio: 0.667,
                  widths: [560, 750, 840, 1000, 1500],
                  sizes: desktop ? ['700px-xxl', '500px-xl', '0.5'] : ['0.9-md'],
                  objectFit: 'contain',
                }}
                lazy={false}
                setImagePreloaderOnServer={this.props.index === 0}
              />
            ))}
          </div>
        )}
        {images && !loading && (
          <div className={`${style.view360}__icon`}>
            <div className={`${style.view360}__icon-svg`}>
              <ReactSVG name="360_view_new" />
              <span>360º</span>
            </div>
            <span>Drag to Spin</span>
          </div>
        )}
      </div>
    );
  }
}
