export function getInitialCode() {
  return `
    window.gladlyHCConfig = {
      api: '${__GLADLY_HC_API__}',
      orgId: '${__GLADLY_HC_ORGID__}',
      brandId: '${__GLADLY_HC_BRANDID__}',
      cdn: '${__GLADLY_CDN__}',
      selector: '#gladly-help-center',
    };
    function l() {
      var t = document,
        e = t.createElement('script');
      (e.type = 'text/javascript'), (e.async = !0), (e.src = 'https://cdn.gladly.com/help-center/hcl.js');
      var a = t.getElementsByTagName('script')[0];
      a.parentNode.insertBefore(e, a);
    }
    var w = window;
    w.attachEvent ? w.attachEvent('onload', l) : w.addEventListener('DOMContentLoaded', l, !1);
  `;
}

export function initConfig() {
  window.gladlyHCConfig = {
    api: __GLADLY_HC_API__,
    orgId: __GLADLY_HC_ORGID__,
    brandId: __GLADLY_HC_BRANDID__,
    cdn: __GLADLY_CDN__,
    selector: '#gladly-help-center',
  };
}

export function loadHC() {
  const t = document;
  const e = t.createElement('script');
  // eslint-disable-next-line no-unused-expressions, no-sequences
  (e.type = 'text/javascript'), (e.async = false), (e.src = 'https://cdn.gladly.com/help-center/hcl.js');

  const HCContainer = document.querySelector('#gladly-help-center');
  HCContainer.parentNode.appendChild(e);
}
