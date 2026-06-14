import React, { createRef, Component } from 'react';
import PropTypes from 'prop-types';
import { withUseBreakpoints } from 'utils/page';

let cachedSvg;
function getSVG() {
  return cachedSvg || (cachedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
}

const helper = {
  isPointerEvent: (event) => self.PointerEvent && event instanceof PointerEvent,
  getDistance: (a, b) => {
    if (!b) return 0;
    return Math.sqrt((b.clientX - a.clientX) ** 2 + (b.clientY - a.clientY) ** 2);
  },
  getMidpoint: (a, b) => {
    if (!b) return a;
    return {
      clientX: (a.clientX + b.clientX) / 2,
      clientY: (a.clientY + b.clientY) / 2,
    };
  },
  getAbsoluteValue: (value, max) => {
    if (typeof value === 'number') return value;
    if (value.trimRight().endsWith('%')) {
      return (max * parseFloat(value)) / 100;
    }
    return parseFloat(value);
  },
  createMatrix: () => getSVG().createSVGMatrix(),
  createPoint: () => getSVG().createSVGPoint(),
  noop: () => {},
};

class Pointer {
  constructor(nativePointer) {
    /** Unique ID for this pointer */
    this.id = -1;
    this.nativePointer = nativePointer;
    this.pageX = nativePointer.pageX;
    this.pageY = nativePointer.pageY;
    this.clientX = nativePointer.clientX;
    this.clientY = nativePointer.clientY;
    if (self.Touch && nativePointer instanceof Touch) {
      this.id = nativePointer.identifier;
    } else if (helper.isPointerEvent(nativePointer)) {
      // is PointerEvent
      this.id = nativePointer.pointerId;
    }
  }

  /**
   * Returns an expanded set of Pointers for high-resolution inputs.
   */
  getCoalesced() {
    if ('getCoalescedEvents' in this.nativePointer) {
      return this.nativePointer.getCoalescedEvents().map((p) => new Pointer(p));
    }
    return [this];
  }
}
/**
 * Track pointers across a particular element
 */
class PointerTracker {
  /**
   * Track pointers across a particular element
   *
   * @param element Element to monitor.
   * @param callbacks
   */
  constructor(_element, callbacks) {
    this._element = _element;
    /**
     * State of the tracked pointers when they were pressed/touched.
     */
    this.startPointers = [];
    /**
     * Latest state of the tracked pointers. Contains the same number
     * of pointers, and in the same order as this.startPointers.
     */
    this.currentPointers = [];
    const { start = () => true, move = helper.noop, end = helper.noop } = callbacks;
    this._startCallback = start;
    this._moveCallback = move;
    this._endCallback = end;
    // Bind methods
    this._pointerStart = this._pointerStart.bind(this);
    this._touchStart = this._touchStart.bind(this);
    this._move = this._move.bind(this);
    this._triggerPointerEnd = this._triggerPointerEnd.bind(this);
    this._pointerEnd = this._pointerEnd.bind(this);
    this._touchEnd = this._touchEnd.bind(this);
    // Add listeners
    if (self.PointerEvent) {
      this._element.addEventListener('pointerdown', this._pointerStart);
    } else {
      this._element.addEventListener('mousedown', this._pointerStart);
      this._element.addEventListener('touchstart', this._touchStart);
      this._element.addEventListener('touchmove', this._move);
      this._element.addEventListener('touchend', this._touchEnd);
    }
  }

  /**
   * Call the start callback for this pointer, and track it if the user wants.
   *
   * @param pointer Pointer
   * @param event Related event
   * @returns Whether the pointer is being tracked.
   */
  _triggerPointerStart(pointer, event) {
    if (!this._startCallback(pointer, event)) return false;
    this.currentPointers.push(pointer);
    this.startPointers.push(pointer);
    return true;
  }

  /**
   * Listener for mouse/pointer starts. Bound to the class in the constructor.
   *
   * @param event This will only be a MouseEvent if the browser doesn't support
   * pointer events.
   */
  _pointerStart(event) {
    if (event.button !== 0 /* Left */) return;
    if (!this._triggerPointerStart(new Pointer(event), event)) return;
    // Add listeners for additional events.
    // The listeners may already exist, but no harm in adding them again.
    if (helper.isPointerEvent(event)) {
      this._element.setPointerCapture(event.pointerId);
      this._element.addEventListener('pointermove', this._move);
      this._element.addEventListener('pointerup', this._pointerEnd);
    } else {
      // MouseEvent
      window.addEventListener('mousemove', this._move);
      window.addEventListener('mouseup', this._pointerEnd);
    }
  }

  /**
   * Listener for touchstart. Bound to the class in the constructor.
   * Only used if the browser doesn't support pointer events.
   */
  _touchStart(event) {
    for (const touch of Array.from(event.changedTouches)) {
      this._triggerPointerStart(new Pointer(touch), event);
    }
  }

  /**
   * Listener for pointer/mouse/touch move events.
   * Bound to the class in the constructor.
   */
  _move(event) {
    const previousPointers = this.currentPointers.slice();
    const changedPointers =
      'changedTouches' in event // Shortcut for 'is touch event'.
        ? Array.from(event.changedTouches).map((t) => new Pointer(t))
        : [new Pointer(event)];
    const trackedChangedPointers = [];
    for (const pointer of changedPointers) {
      const index = this.currentPointers.findIndex((p) => p.id === pointer.id);
      if (index !== -1) {
        trackedChangedPointers.push(pointer);
        this.currentPointers[index] = pointer;
      } // Not a pointer we're tracking
    }
    if (trackedChangedPointers.length === 0) return;
    this._moveCallback(previousPointers, trackedChangedPointers, event);
  }

  /**
   * Call the end callback for this pointer.
   *
   * @param pointer Pointer
   * @param event Related event
   */
  _triggerPointerEnd(pointer, event) {
    const index = this.currentPointers.findIndex((p) => p.id === pointer.id);
    // Not a pointer we're interested in?
    if (index === -1) return false;
    this.currentPointers.splice(index, 1);
    this.startPointers.splice(index, 1);
    this._endCallback(pointer, event);
    return true;
  }

  /**
   * Listener for mouse/pointer ends. Bound to the class in the constructor.
   * @param event This will only be a MouseEvent if the browser doesn't support
   * pointer events.
   */
  _pointerEnd(event) {
    if (!this._triggerPointerEnd(new Pointer(event), event)) return;
    if (helper.isPointerEvent(event)) {
      if (this.currentPointers.length) return;
      this._element.removeEventListener('pointermove', this._move);
      this._element.removeEventListener('pointerup', this._pointerEnd);
    } else {
      // MouseEvent
      window.removeEventListener('mousemove', this._move);
      window.removeEventListener('mouseup', this._pointerEnd);
    }
  }

  /**
   * Listener for touchend. Bound to the class in the constructor.
   * Only used if the browser doesn't support pointer events.
   */
  _touchEnd(event) {
    for (const touch of Array.from(event.changedTouches)) {
      this._triggerPointerEnd(new Pointer(touch), event);
    }
  }
}

@withUseBreakpoints
class Zoom extends Component {
  // static getDerivedStateFromProps(props) {
  //   const { children } = props;
  // const { children } = props;
  // if (React.Children.count(children) === 1 && children.type === 'img') {
  //   return {
  //     isPicture: true,
  //   };
  // }
  // return {
  //   isPicture: false,
  // };
  // }

  static propTypes = {
    reset: PropTypes.func,
    change: PropTypes.func,
    minScale: PropTypes.number,
    maxScale: PropTypes.number,
    className: PropTypes.string,
    breakpoints: PropTypes.object,
  };

  static defaultProps = {
    minScale: 1,
    maxScale: 4,
  };

  imgRef = createRef();

  coverRef = createRef();

  changeRef = false;

  resetRef = false;

  scaleRef = false;

  twoFingerRef = false;

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      scale: false,
      // FIXME We will judge later
      isPicture: true,
    };

    this.coverEle = this._createCover();

    this._transform = helper.createMatrix();
  }

  componentDidMount() {
    const { isPicture, mounted } = this.state;
    if (isPicture && !mounted) {
      this.setState({
        mounted: true,
      });
    }
  }

  componentDidUpdate(_, preState) {
    const { current: cover } = this.coverRef;
    const { current: img } = this.imgRef;
    const { isPicture, mounted } = this.state;
    if (isPicture && mounted && !preState.mounted) {
      this.pointerTracker = new PointerTracker(cover, {
        start: (pointer, event) => {
          // We only want to track 2 pointers at most
          if (this.pointerTracker.currentPointers.length === 2 || !img) return false;
          return true;
        },
        move: (previousPointers) => {
          if (this.scaleRef || this.twoFingerRef) {
            this._onPointerMove(previousPointers, this.pointerTracker.currentPointers);
          }
        },
      });
      cover.addEventListener('wheel', this._onWheel);
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    const { current: cover } = this.coverRef;
    reset();
    cover?.removeEventListener('wheel', this._onWheel);
  }

  get x() {
    return this._transform.e;
  }

  get y() {
    return this._transform.f;
  }

  get scale() {
    return this._transform.a;
  }

  _createCover = () => {
    const { className = '' } = this.props;
    return React.createElement('div', {
      ref: this.coverRef,
      className,
      style: { cursor: 'pointer' },
    });
  };

  _initImgRef = () => {
    const { children } = this.props;
    const { ref } = children;
    if (ref) {
      this.imgRef = ref;
      this.imgEle = children;
    } else {
      this.imgEle = React.cloneElement(children, { ref: this.imgRef });
    }
  };

  /**
   * Update the stage with a given scale/x/y.
   */
  setTransform = (opts = {}) => {
    const { scale = this.scale } = opts;
    let { x = this.x, y = this.y } = opts;
    const { current: image } = this.imgRef;
    const { current: cover } = this.coverRef;
    // If we don't have an element to position, just set the value as given.
    // We'll check bounds later.
    if (!image) {
      this._updateTransform(scale, x, y);
      return;
    }
    // Get current layout
    const thisBounds = cover.getBoundingClientRect();
    const positioningElBounds = image.getBoundingClientRect();
    // Not displayed. May be disconnected or display:none.
    // Just take the values, and we'll check bounds later.
    if (!thisBounds.width || !thisBounds.height) {
      this._updateTransform(scale, x, y);
      return;
    }
    // Create points for _positioningEl.
    let topLeft = helper.createPoint();
    topLeft.x = positioningElBounds.left - thisBounds.left;
    topLeft.y = positioningElBounds.top - thisBounds.top;
    let bottomRight = helper.createPoint();
    bottomRight.x = positioningElBounds.width + topLeft.x;
    bottomRight.y = positioningElBounds.height + topLeft.y;
    // Calculate the intended position of _positioningEl.
    const matrix = helper
      .createMatrix()
      .translate(x, y)
      .scale(scale)
      // Undo current transform
      .multiply(this._transform.inverse());
    topLeft = topLeft.matrixTransform(matrix);
    bottomRight = bottomRight.matrixTransform(matrix);
    // Ensure _positioningEl can't move beyond out-of-bounds.
    // Correct for x
    if (topLeft.x > thisBounds.width) {
      x += thisBounds.width - topLeft.x;
    } else if (bottomRight.x < 0) {
      x += -bottomRight.x;
    }
    // Correct for y
    if (topLeft.y > thisBounds.height) {
      y += thisBounds.height - topLeft.y;
    } else if (bottomRight.y < 0) {
      y += -bottomRight.y;
    }
    this._updateTransform(scale, x, y);
  };

  /**
   * Update transform values without checking bounds. This is only called in setTransform.
   */
  _updateTransform = (scale, x, y) => {
    const { scale: stateScale } = this.state;
    const { minScale, maxScale, reset, change } = this.props;
    const { current: img } = this.imgRef;
    if (scale > maxScale) return;
    // Return if there's no change
    if (scale === this.scale && x === this.x && y === this.y) return;

    if (scale <= minScale) {
      if (stateScale) {
        this.setState({ scale: false });
      }
      if (!this.resetRef) {
        img.style.transition = 'transform, 0.2s';
        this._transform.e = 0;
        this._transform.f = 0;
        this._transform.d = 1;
        this._transform.a = 1;
        this.resetRef = true;
        this.changeRef = false;
        this.scaleRef = false;
        reset();
        img.style.transform = `translate(${0}px, ${0}px) scale(${1})`;
      }
      return;
    }
    this._transform.e = x;
    this._transform.f = y;
    this._transform.d = scale;
    this._transform.a = scale;
    img.style.transition = 'none';
    if (!stateScale) {
      this.setState({ scale: true });
    }
    if (!this.changeRef) {
      this.changeRef = true;
      this.resetRef = false;
      this.scaleRef = true;
      change();
    }
    img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  };

  _reset = () => {
    const { scale } = this.state;
    const { reset } = this.props;
    const { current: img } = this.imgRef;
    if (scale) {
      this.setState({ scale: false });
    }
    if (!this.resetRef) {
      img.style.transition = 'transform, 0.2s';
      this._transform.e = 0;
      this._transform.f = 0;
      this._transform.d = 1;
      this._transform.a = 1;
      this.resetRef = true;
      this.changeRef = false;
      this.scaleRef = false;
      reset();
      img.style.transform = `translate(${0}px, ${0}px) scale(${1})`;
    }
  };

  _onWheel = (event) => {
    const { current: img } = this.imgRef;
    if (!img) return;
    event.preventDefault();
    const currentRect = img.getBoundingClientRect();
    let { deltaY } = event;
    const { ctrlKey, deltaMode } = event;
    if (deltaMode === 1) {
      // 1 is "lines", 0 is "pixels"
      // Firefox uses "lines" for some types of mouse
      deltaY *= 15;
    }
    // ctrlKey is true when pinch-zooming on a trackpad.
    const divisor = ctrlKey ? 100 : 300;
    const scaleDiff = 1 - deltaY / divisor;
    this._applyChange({
      scaleDiff,
      originX: event.clientX - currentRect.left,
      originY: event.clientY - currentRect.top,
    });
  };

  _onPointerMove = (previousPointers, currentPointers) => {
    const { current: img } = this.imgRef;
    if (!img) return;
    // Combine next points with previous points
    const currentRect = img.getBoundingClientRect();
    // For calculating panning movement
    const prevMidpoint = helper.getMidpoint(previousPointers[0], previousPointers[1]);
    const newMidpoint = helper.getMidpoint(currentPointers[0], currentPointers[1]);
    // Midpoint within the element
    const originX = prevMidpoint.clientX - currentRect.left;
    const originY = prevMidpoint.clientY - currentRect.top;
    // Calculate the desired change in scale
    const prevDistance = helper.getDistance(previousPointers[0], previousPointers[1]);
    const newDistance = helper.getDistance(currentPointers[0], currentPointers[1]);
    const scaleDiff = prevDistance ? newDistance / prevDistance : 1;
    this._applyChange({
      originX,
      originY,
      scaleDiff,
      panX: newMidpoint.clientX - prevMidpoint.clientX,
      panY: newMidpoint.clientY - prevMidpoint.clientY,
    });
  };

  /** Transform the view & fire a change event */
  _applyChange = (opts = {}) => {
    const { panX = 0, panY = 0, originX = 0, originY = 0, scaleDiff = 1 } = opts;
    const matrix = helper
      .createMatrix()
      // Translate according to panning.
      .translate(panX, panY)
      // Scale about the origin.
      .translate(originX, originY)
      // Apply current translate
      .translate(this.x, this.y)
      .scale(scaleDiff)
      .translate(-originX, -originY)
      // Apply current scale.
      .scale(this.scale);
    // Convert the transform into basic translate & scale.
    this.setTransform({
      scale: matrix.a,
      x: matrix.e,
      y: matrix.f,
    });
  };

  _touchStart = (evt) => {
    clearTimeout(this.timmer);
    const { change, reset } = this.props;
    if (evt.touches && evt.touches.length === 2) {
      this.twoFingerRef = true;
      change();
    } else {
      this.timmer = setTimeout(() => {
        if (!this.scaleRef && !this.twoFingerRef) {
          reset();
        }
      });
    }
  };

  _touchEnd = () => {
    clearTimeout(this.timmer);
    this.twoFingerRef = false;
    this.pointerTracker.currentPointers = [];
  };

  render() {
    const { children, breakpoints = {} } = this.props;
    const { isPicture, mounted, scale } = this.state;
    const { desktop } = breakpoints;
    if (isPicture) {
      if (!mounted) {
        this._initImgRef();
        return this.imgEle;
      }
      return React.cloneElement(
        this.coverEle,
        { onTouchStart: this._touchStart, onTouchEnd: this._touchEnd },
        React.cloneElement(this.imgEle, {
          style: {
            willChange: 'transform',
            transformOrigin: '0 0',
          },
        }),
        !desktop && scale && (
          <button
            type="button"
            className="btn"
            onClick={this._reset}
            style={{
              position: 'fixed',
              top: '14px',
              right: '70px',
              outline: 'none',
              fontSize: '14px',
              paddingTop: '4px',
              paddingBottom: '4px',
              backgroundColor: 'transparent',
              color: '#fff',
              borderColor: '#fff',
            }}
          >
            zoom out
          </button>
        )
      );
    }
    return children;
  }
}

export default Zoom;
