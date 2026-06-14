/* eslint-disable no-undef */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { googleMapApiKey } from 'config';
import ImageLoader from 'components/ImageLoader';
import isEqual from 'lodash/isEqual';
import clone from 'lodash/clone';
import Script from 'components/Script';
import markerIcon from './marker.png';
import style from './style.scss';

export default class GoogleMap extends Component {
  static callbackList = [];

  static loadMap = () => {
    if (typeof window._$_google_map_initialize_$_ !== 'undefined') {
      return;
    }

    window._$_google_map_initialize_$_ = function () {
      delete window._$_google_map_initialize_$_;
      GoogleMap.callbackList.forEach((callback) => callback(window.google.maps));
      GoogleMap.callbackList = [];
    };

    const loadApi = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapApiKey}&callback=_$_google_map_initialize_$_`;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

    loadApi.catch(() => {
      if (typeof window.google === 'undefined') {
        console.error('google map initialization error (not loaded)');
      }
    });
  };

  static propTypes = {
    className: PropTypes.string,
    // can be static map if passing static = true
    // center and zoom must be provided, width and height must be provided if it's a static map
    options: PropTypes.object,
  };

  componentDidMount() {
    if (!this.props.options.static) {
      this.init(this.props.options);
    }
  }

  static getDerivedStateFromProps(nextProps) {
    // if (!isEqual(this.props.options, nextProps.options)) {
    //   console.log('this', this.props.options);
    //   console.log('next', nextProps.options);
    // }
    if (!isEqual(this.props.options, nextProps.options) && !nextProps.options.static) {
      this.init(nextProps.options);
    }
  }

  init(options) {
    this.addCallback((maps) => {
      // create map
      // use clone to shallow copy options as Map() will change original options, which
      // will cause reinit if new props are passed
      const map = new maps.Map(this.googleMapDom, clone(options));
      // attach marker
      // eslint-disable-next-line no-new
      new maps.Marker({
        position: options.center,
        map,
        icon: {
          url: markerIcon,
          scaledSize: new google.maps.Size(32, 45),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(16, 45),
        },
      });
    });
  }

  addCallback(callback) {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.google && window.google.maps) {
      callback(window.google.maps);
    } else {
      GoogleMap.callbackList.push(callback);
      GoogleMap.loadMap();
    }
  }

  render() {
    const { className, options } = this.props;

    if (options.static) {
      const src =
        'https://maps.googleapis.com/maps/api/staticmap?' +
        `size=${options.width}x${options.height}&scale=2&zoom=${options.zoom}&` +
        `center=${options.center.lat},${options.center.lng}&format=jpg&key=${googleMapApiKey}`;

      return (
        <ImageLoader
          style={{ paddingTop: `${(options.height / options.width) * 100}%` }}
          src={src}
          className={`${style.static}__wrapper ${className}`}
        >
          <div className={`${className} ${style.static}`}>
            <img alt={options.alt} src={src} />
            <img className={`${style.static}__marker`} src={markerIcon} alt="marker" />
          </div>
        </ImageLoader>
      );
    }
    return <div ref={(c) => (this.googleMapDom = c)} className={className} />;
  }
}

/**
 * is the Function Component implementation of the GoogleMap Component
 * @param {*} props
 * @returns
 */
export const NewGoogleMap = (props) => {
  const {
    className,
    style: _style,
    // can be static map if passing static = true
    // center and zoom must be provided, width and height must be provided if it's a static map
    options,
  } = props;

  const mapRef = React.createRef();

  if (options.static) {
    const src =
      'https://maps.googleapis.com/maps/api/staticmap?' +
      `size=${options.width}x${options.height}&scale=2&zoom=${options.zoom}&` +
      `center=${options.center.lat},${options.center.lng}&format=jpg&key=${googleMapApiKey}`;
    return (
      <>
        <ImageLoader src={src} className={`${style.static}__wrapper ${className}`} style={{ ..._style }}>
          <div className={`${className} ${style.static}`} style={{ ..._style }}>
            <img alt={options.alt} src={src} />
            <img className={`${style.static}__marker`} src={markerIcon} alt="marker" />
          </div>
        </ImageLoader>
      </>
    );
  }

  return (
    <>
      <div ref={mapRef} className={className} style={_style} />
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${googleMapApiKey}`}
        onReady={() => {
          // create map
          // eslint-disable-next-line no-undef
          const map = new google.maps.Map(mapRef.current, options);

          // attach marker
          // eslint-disable-next-line no-new, no-undef
          new google.maps.Marker({
            position: options.center,
            map,
            icon: {
              url: markerIcon,
              scaledSize: new google.maps.Size(32, 45),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(16, 45),
            },
          });
        }}
        onError={() => {
          console.error('google map initialization error (not loaded)');
        }}
      />
    </>
  );
};

NewGoogleMap.propTypes = {
  options: PropTypes.shape({
    static: PropTypes.bool,
    center: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }),
    config: PropTypes.bool,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    zoom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    alt: PropTypes.string,
  }),
  style: PropTypes.object,
  className: PropTypes.string,
};
