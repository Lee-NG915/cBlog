/**
 * Available interaction types
 */
export enum EventActions {
  // =========================== User Interaction Events Start ==========================
  /**
   * @description the targetElement is visible within the viewport
   * @trigger new IntersectionObserver().observe(targetElement);
   */
  impression = 'IMPRESSION',
  /**
   * @description the element is displayed on the page (show)
   */
  view = 'VIEW',
  /**
   * @trigger targetElement.onClick
   */
  click = 'CLICK',
  /**
   * @trigger targetElement.onHover
   */
  hover = 'HOVER',
  /**
   * @trigger targetElement.onFocus
   */
  focus = 'FOCUS',
  /**
   * @trigger targetElement.onScroll
   */
  scroll = 'SCROLL',
  /**
   * @trigger targetElement.onKeyPress
   */
  keyPress = 'KEY_PRESS',
  change = 'CHANGE',
  input = 'INPUT',
  /**
   * @trigger targetElement.onSubmit
   */
  submit = 'SUBMIT',
  /**
   * targetElement.onBlur
   */
  blur = 'BLUR',
  page_view = 'PAGE_VIEW',
  // ================================ User Interaction Events End ==========================
  /** ================ Page Interaction Events Start ================ */
  window_resize = 'WINDOW_RESIZE',
  window_scroll = 'WINDOW_SCROLL',
  window_load = 'WINDOW_LOAD',
  /**
   * @trigger document.addEventListener('visibilitychange', () => { console.log(document.visibilityState === 'visible'); });
   */
  window_visibility = 'WINDOW_VISIBILITY',
  window_close = 'WINDOW_CLOSE',
  reload = 'WINDOW_RELOAD',
  refresh = 'WINDOW_REFRESH',
  /** ================ Page Interaction Events End ================ */
  /** ================ Performance Events Start ================ */

  /** ================ Performance Events End ================ */
}

// EventActions.window_visibility
export type EventActionsTypes = typeof EventActions;
