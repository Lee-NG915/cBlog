/* eslint-disable no-param-reassign */
export const loadAffirm = () => {
  // public_api_key: affirmPublicKey,
  const _affirm_config = {
    public_api_key: __AFFIRM_PUBLIC_KEY__,
    script: __AFFIRM_SCRIPT__,
  };
  const setupAffirm = function (l, g, m, e, a, f, b) {
    let d;
    const c = l[m] || {};
    const h = document.createElement(f);
    const n = document.getElementsByTagName(f)[0];
    const k = function (a, b, c) {
      return function () {
        a[b]._.push([c, arguments]);
      };
    };
    c[e] = k(c, e, 'set');
    // eslint-disable-next-line prefer-const
    d = c[e];
    c[a] = {};
    c[a]._ = [];
    d._ = [];
    c[a][b] = k(c, a, b);
    a = 0;
    for (b = 'set add save post open empty reset on off trigger ready setProduct'.split(' '); a < b.length; a++) {
      d[b[a]] = k(c, e, b[a]);
    }
    a = 0;
    for (b = ['get', 'token', 'url', 'items']; a < b.length; a++) {
      d[b[a]] = function () {};
    }
    h.async = !0;
    h.src = g[f];
    n.parentNode.insertBefore(h, n);
    delete g[f];
    d(g);
    l[m] = c;
    return h;
  };
  return setupAffirm(window, _affirm_config, 'affirm', 'checkout', 'ui', 'script', 'ready');
};
