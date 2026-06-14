import * as easing from 'easing-utils';

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
const requestAnimFrame = (function () {
  if (__CLIENT__) {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  }
})();

export function animate(options) {
  const _from = options.from || 0;
  const _to = options.to || 0;
  const _duration = options.duration || 200;
  const _func = options.func || 'easeOutQuad';
  const _callback = options.callback;
  const _done = options.done;

  const _start = Date.now();
  const _distance = _to - _from;

  const _animate = () => {
    const _now = Date.now();
    let t = _duration > 0 ? (_now - _start) / _duration : 1;

    // deal with overrun case
    if (t > 1) {
      t = 1;
    }

    const _current = easing[_func](t) * _distance + _from;

    if (_callback) {
      _callback(_current);
    }

    if (t === 1 && _done) {
      _done();
    }

    if (t < 1) {
      requestAnimFrame(_animate);
    }
  };

  _animate();
}
