/**

  Show a loading animation for image loading.

 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Spinner from 'components/Spinner';
import style from './style.scss';

export default class ImageLoader extends Component {
  static propTypes = {
    src: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
  };

  // load single image and return a promise
  static loadSingleImage(src) {
    const img = new Image();
    img.src = src;
    if (img.complete) {
      return Promise.resolve(img);
    }
    return new Promise((resolve) => {
      img.onload = () => resolve(img);
    });
  }

  state = { loaded: false };

  UNSAFE_componentWillMount() {
    this.loadImage();
  }

  loadImage() {
    const { src } = this.props;

    if (Array.isArray(src)) {
      const promises = [];

      src.forEach((s) => {
        promises.push(ImageLoader.loadSingleImage(s));
      });

      Promise.all(promises).then(() => this.imgLoaded());
    } else {
      ImageLoader.loadSingleImage(src).then(() => this.imgLoaded());
    }
  }

  imgLoaded() {
    this.setState({ loaded: true });
  }

  render() {
    const { loaded } = this.state;
    const { style: postStyle, className, children } = this.props;
    if (loaded) {
      return children;
    }
    return (
      <div style={postStyle} className={className || style.default}>
        <Spinner />
      </div>
    );
  }
}
