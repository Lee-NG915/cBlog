import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

class Preview extends Component {
  static propTypes = {
    children: PropTypes.element,
    oneFingerMove: PropTypes.bool,
  };

  static defaultProps = {
    oneFingerMove: false,
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

  static getLengthOfLine = (point1, point2) => Math.hypot(point1.pageX - point2.pageX, point1.pageY - point2.pageY);

  static getMiddleOfLine = (point1, point2) => ({
    clientX: Math.min(point2.clientX, point1.clientX) + Math.abs(point2.clientX - point1.clientX) / 2,
    clientY: Math.min(point2.clientY, point1.clientY) + Math.abs(point2.clientY - point1.clientY) / 2,
  });

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
  }

  componentDidMount() {
    const { isPicture, mounted } = this.state;
    if (isPicture && !mounted) {
      this.setState({
        mounted: true,
      });
    }
  }

  setTransitionDuration = (duration) => {
    const { current: img } = this.imgRef;
    img.style.transitionDuration = `${duration}ms`;
  };

  setTransform = (scale, translateX, translateY) => {
    const { current: img } = this.imgRef;
    img.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)
      scale3d(${scale}, ${scale}, 1)`;
  };

  setTransformOrigin = (x, y) => {
    const { current: img } = this.imgRef;
    img.style.transformOrigin = `${x} ${y} 0`;
  };

  _singleTouchStart = (evt) => {
    this.finger = 1;
    this.initTialX = evt.touches[0].pageX;
    this.initTialY = evt.touches[0].pageY;
  };

  _singleTouchMove = (evt) => {
    if (this.finger === 1) {
      const currentX = evt.touches[0].pageX;
      const currentY = evt.touches[0].pageY;
      const moveX = currentX - this.initTialX;
      const moveY = currentY - this.initTialY;
      this.initTialMoveX = moveX;
      this.initTialMoveY = moveY;
      this.setTransform(this.scale || 1, moveX, moveY);
    }
  };

  _singleTouchEnd = (evt) => {
    this.setTransitionDuration(this.transitionDuration || 400);
    this.initTialMoveX = 0;
    this.initTialMoveY = 0;
    this.setTransform(1, 0, 0);
  };

  _doubleTouchStart = (evt) => {
    this.finger = 2;
    const { current: img } = this.imgRef;
    this.initialBoundingRect = img.getBoundingClientRect();
    if (!Preview.isTouchesInsideRect(evt.touches, this.initialBoundingRect)) {
      return;
    }
    evt.preventDefault();
    const touch1 = evt.touches[0];
    const touch2 = evt.touches[1];
    // 获取中间点
    const middleTouchOnElement = Preview.getMiddleTouchOnElement(evt.touches, this.initialBoundingRect);
    // 设置transform-origin
    this.setTransformOrigin(`${middleTouchOnElement.clientX}px`, `${middleTouchOnElement.clientY}px`);
    this.scrollAble = true;
    this.initTialPoint1 = touch1;
    this.initTialPoint2 = touch2;
    this.initTialScale = this.scale || 1;
  };

  _doubelTouchMove = (evt) => {
    if (this.scrollAble && this.finger === 2) {
      evt.preventDefault();
      const touch1 = evt.touches[0];
      const touch2 = evt.touches[1];
      if (!this.initTialPoint2) {
        this.initTialPoint2 = touch2;
      }
      const scale =
        Preview.getLengthOfLine(touch1, touch2) / Preview.getLengthOfLine(this.initTialPoint1, this.initTialPoint2);
      let newScale = this.initTialScale * scale;
      if (newScale > 5) {
        newScale = 5;
      }
      if (newScale < 0.5) {
        newScale = 0.5;
      }
      this.scale = newScale;
      this.setTransform(newScale, this.initTialMoveX || 0, this.initTialMoveY || 0);
    }
  };

  _doubleTouchEnd = (evt) => {
    this.setTransitionDuration(this.transitionDuration || 400);
    this.setTransform(1, this.initTialMoveX || 0, this.initTialMoveY || 0);
    this.scale = 1;
    if (evt && evt.touches && evt.touches.length) {
      this.finger = 1;
    } else {
      this.finger = null;
    }
    this.scrollAble = false;
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.setTransitionDuration(0);
      this.setTransformOrigin('50%', '50%');
    }, this.transitionDuration || 400);
  };

  _touchStart = (evt) => {
    const { oneFingerMove } = this.props;
    const currentNum = evt.touches.length;
    if (currentNum === 1 && oneFingerMove) {
      this._singleTouchStart(evt);
    } else if (currentNum === 2) {
      this._doubleTouchStart(evt);
    }
  };

  _touchMove = (evt) => {
    const { oneFingerMove } = this.props;
    const currentNum = evt.touches.length;
    this.setTransitionDuration(0);
    if (currentNum === 2 && this.finger === 2) {
      this._doubelTouchMove(evt);
    } else if (currentNum === 1 && this.finger === 1 && oneFingerMove) {
      this._singleTouchMove(evt);
    }
  };

  _touchEnd = (evt) => {
    const { oneFingerMove } = this.props;
    if (this.finger === 2) {
      this._doubleTouchEnd(evt);
    } else if (this.finger === 1 && oneFingerMove) {
      this._singleTouchEnd(evt);
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
      return React.cloneElement(this.imgItem, {
        onTouchStart: this._touchStart,
        onTouchMove: this._touchMove,
        onTouchEnd: this._touchEnd,
      });
    }
    return children;
  }
}

export default Preview;
