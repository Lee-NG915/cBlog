import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import Finger from './Finger';

class Preview extends Component {
  static propTypes = {
    children: PropTypes.element,
    maxScale: PropTypes.number,
    minScale: PropTypes.number,
    transitionDuration: PropTypes.number,
  };

  static defaultProps = {
    maxScale: 6,
    minScale: 0.8,
    transitionDuration: 400,
  };

  static getDerivedStateFromProps(props) {
    const { children } = props;
    if (React.Children.count(children) === 1 && children.type === 'img') {
      return {
        isPicture: true,
      };
    }
    return {
      isPicture: false,
    };
  }

  // 获取两点之间距离
  static getLengthOfLine = (point1, point2) =>
    Math.hypot(point1.clientX - point2.clientX, point1.clientY - point2.clientY);

  // 获取两点之间的中间点
  static getMiddleOfLine = (point1, point2) => ({
    clientX: Math.min(point2.clientX, point1.clientX) + Math.abs(point2.clientX - point1.clientX) / 2,
    clientY: Math.min(point2.clientY, point1.clientY) + Math.abs(point2.clientY - point1.clientY) / 2,
  });

  // 获取图片中点
  static getMiddleTouchOnElement(touches, boundingRect) {
    const middleTouch = Preview.getMiddleOfLine(touches[0], touches[1]);

    return {
      clientX: middleTouch.clientX - boundingRect.left,
      clientY: middleTouch.clientY - boundingRect.top,
    };
  }

  static getTransformByMatrix(translateString) {
    let matrix = translateString.match(/matrix(3d)?\((.+?)\)/);
    const is3D = matrix && matrix[1];
    if (matrix) {
      matrix = matrix[2].split(',');
      if (is3D === '3d') matrix = matrix.slice(12, 15);
      else {
        matrix.push(0);
        matrix = matrix.slice(4, 7);
      }
    } else {
      matrix = [0, 0, 0];
    }
    return {
      x: parseFloat(matrix[0]),
      y: parseFloat(matrix[1]),
      z: parseFloat(matrix[2]),
    };
  }

  static isTouchesInsideRect = (touches, rect) =>
    Array.prototype.every.call(
      touches,
      (touch) =>
        touch.clientX <= rect.right &&
        touch.clientX >= rect.left &&
        touch.clientY <= rect.bottom &&
        touch.clientY >= rect.top
    );

  imgRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
    };

    this.imgItem = props.children;

    this.scale = 1;
    this.zoomScale = 1;
  }

  componentDidMount() {
    const { isPicture, mounted } = this.state;
    if (isPicture && !mounted) {
      this.setState({
        mounted: true,
      });
    }
  }

  // 设置previewImageDom动画时长
  setTransitionDuration = (duration) => {
    const { current: img } = this.imgRef;
    img.style.transitionDuration = `${duration}ms`;
  };

  // 设置previewImageDom transform
  setTransform = (scale, translateX, translateY) => {
    const { current: img } = this.imgRef;
    const { maxScale, minScale } = this.props;
    let tScale = scale < minScale ? minScale : scale;
    tScale = tScale > maxScale ? maxScale : tScale;
    img.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)` + `scale3d(${tScale}, ${tScale}, 1)`;
  };

  // 设置previewImageDom transformOrigin
  setTransformOrigin = (x, y) => {
    const { current: img } = this.imgRef;
    img.style.transformOrigin = `${x} ${y} 0`;
  };

  // 重置双指部分信息
  resetProperties = () => {
    this.firstTouch = null;
    this.initialPinchLength = null;
    this.currentPinchLength = null;
    this.initialBoundingRect = null;
  };

  _doubleTap = (evt) => {
    const { transitionDuration } = this.props;
    if (this.open) {
      this.setTransform(1, 0, 0);
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.open = false;
        this.setTransitionDuration(0);
        this.setTransformOrigin('50%', '50%');
      }, transitionDuration);
    } else {
      // 初始进行放大
      const { current: img } = this.imgRef;
      this.initialBoundingRect = img.getBoundingClientRect();
      this.open = true;
      this.pageX = evt.origin[0];
      this.pageY = evt.origin[1];
      this.initialTransformOrigin = {
        x: this.pageX - this.initialBoundingRect.left,
        y: this.pageY - this.initialBoundingRect.top,
      };
      this.setTransitionDuration(transitionDuration);
      this.setTransformOrigin(`${this.initialTransformOrigin.x}px`, `${this.initialTransformOrigin.y}px`);
      const translateX = window.innerWidth / 2 - this.initialTransformOrigin.x;
      const translateY = window.innerHeight / 2 - this.initialTransformOrigin.y;
      this.initialTranslateX = translateX;
      this.initialTranslateY = translateY;
      this.scale = 2;
      this.setTransform(2, translateX, translateY);
    }
  };

  _singlePonitStart = (evt) => {
    this.setTransitionDuration(0);
    this.startX = evt.touches[0].pageX;
    this.startY = evt.touches[0].pageY;
  };

  _singlePointMove = (evt) => {
    const currentX = evt.changedTouches[0].pageX;
    const currentY = evt.changedTouches[0].pageY;
    const moveX = currentX - this.startX;
    const moveY = currentY - this.startY;
    this.setTransform(
      this.scale + (this.zoomScale - 1) || 0,
      this.initialTranslateX + (this.zoomTranslateX || 0) + moveX,
      this.initialTranslateY + (this.zoomTranslateY || 0) + moveY
    );
  };

  _singlePointEnd = () => {
    const { transitionDuration } = this.props;
    this.setTransitionDuration(transitionDuration);
    this.setTransform(this.scale + (this.zoomScale - 1) || 0, this.initialTranslateX, this.initialTranslateY);
  };

  _doublePointStart = (evt) => {
    const { current: img } = this.imgRef;
    const { transitionDuration } = this.props;
    this.initialBoundingRect = img.getBoundingClientRect();
    this.setTransitionDuration(transitionDuration);
    if (
      !evt.touches.length ||
      evt.touches.length !== 2 ||
      !Preview.isTouchesInsideRect(evt.touches, this.initialBoundingRect)
    ) {
      return;
    }
    // 获取中间点
    const middleTouchOnElement = Preview.getMiddleTouchOnElement(evt.touches, this.initialBoundingRect);
    // 初始双指两点之间的距离
    this.initialPinchLength = Preview.getLengthOfLine(evt.touches[0], evt.touches[1]);
    // 记录手指信息
    this.firstTouch = middleTouchOnElement;
  };

  _doublePointMove = (evt) => {
    const middleTouchOnElement = Preview.getMiddleTouchOnElement(evt.touches, this.initialBoundingRect);
    // 当前双指两点之间的距离
    this.currentPinchLength = Preview.getLengthOfLine(evt.touches[0], evt.touches[1]);
    //  scale = 当前双指两点之间的距离 / 初始双指两点之间的距离
    const scale = this.currentPinchLength / this.initialPinchLength;
    const translateX = middleTouchOnElement.clientX - this.firstTouch.clientX;
    const translateY = middleTouchOnElement.clientY - this.firstTouch.clientY;

    this.setTransform(
      this.scale + this.zoomScale - 1 + scale - 1,
      this.initialTranslateX + translateX,
      this.initialTranslateY + translateY
    );

    this.zoomScale = scale;
    this.zoomTranslateX = translateX;
    this.zoomTranslateY = translateY;
  };

  _doublePointEnd = () => {
    this.resetProperties();
  };

  _touchStart = (evt) => {
    const currentNum = evt.touches.length;
    if (this.open) {
      if (currentNum === 1) {
        this.fingerNum = 1;
        evt.preventDefault();
        this._singlePonitStart(evt);
      } else if (currentNum === 2) {
        this.fingerNum = 2;
        evt.preventDefault();
        this._doublePointStart(evt);
      }
    }
  };

  _touchMove = (evt) => {
    const currentNum = evt.touches.length;
    if (this.open) {
      if (currentNum === 1 && this.fingerNum === 1) {
        evt.preventDefault();
        this._singlePointMove(evt);
      } else if (currentNum === 2 && this.fingerNum === 2) {
        evt.preventDefault();
        this._doublePointMove(evt);
      }
    }
  };

  _touchEnd = () => {
    if (this.open) {
      if (this.fingerNum === 1) {
        this.fingerNum = null;
        this._singlePointEnd();
      } else if (this.fingerNum === 2) {
        this.fingerNum = null;
        this._doublePointEnd();
      }
    }
  };

  initImgRef = (newChildren) => {
    const { children } = this.props;
    const targetChildren = newChildren || children;
    const { ref } = targetChildren;
    if (ref) {
      this.imgRef = ref;
    } else {
      this.imgItem = React.cloneElement(targetChildren, {
        ref: this.imgRef,
      });
    }
  };

  render() {
    const { children } = this.props;
    const { isPicture, mounted } = this.state;

    if (isPicture) {
      if (!mounted) {
        this.initImgRef();
        return this.imgItem;
      }
      return (
        <Finger
          onTouchStart={this._touchStart}
          onTouchMove={this._touchMove}
          onTouchEnd={this._touchEnd}
          onDoubleTap={this._doubleTap}
        >
          {this.imgItem}
        </Finger>
      );
    }
    return children;
  }
}

export default Preview;
