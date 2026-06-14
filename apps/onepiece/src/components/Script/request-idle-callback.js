export const requestIdleCallback =
  (typeof window !== 'undefined' && window.requestIdleCallback && window.requestIdleCallback.bind(window)) ||
  function (cb) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining() {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };

export const cancelIdleCallback =
  (typeof window !== 'undefined' && window.cancelIdleCallback && window.cancelIdleCallback.bind(window)) ||
  function (id) {
    return clearTimeout(id);
  };
