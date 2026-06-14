export const ignoreErrors = [
  // https://docs.sentry.io/platforms/javascript/#decluttering-sentry
  // Random plugins/extensions
  'top.GLOBALS',
  // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
  'originalCreateNotification',
  'canvas.contentDocument',
  'MyApp_RemoveAllHighlights',
  'http://tt.epicplay.com',
  "Can't find variable: ZiteReader",
  'jigsaw is not defined',
  'ComboSearch is not defined',
  'http://loading.retry.widdit.com/',
  'atomicFindClose',
  // Facebook borked
  'fb_xd_fragment',
  // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
  // reduce this. (thanks @acdha)
  // See http://stackoverflow.com/questions/4113268
  'bmi_SafeAddOnload',
  'EBCallBackMessageReceived',
  // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
  'conduitPage',

  // https://blog.sentry.io/making-your-javascript-projects-less-noisy/#ignore-un-actionable-errors
  /**
   * Thrown when firefox prevents an add-on from refrencing a DOM element that has been removed.
   * This can also be filtered by enabling the browser extension inbound filter
   */
  "TypeError: can't access dead object",
  /**
   * React internal error thrown when something outside react modifies the DOM
   * This is usually because of a browser extension or Chrome's built-in translate
   */
  "NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
  "NotFoundError: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.",
];
