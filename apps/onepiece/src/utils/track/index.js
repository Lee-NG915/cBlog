import { TARGET_GTM, TARGET_KLAVIYO } from './constants';
import gtmEventsMap from './gtmEventsMap';
import klaviyoEventsMap from './klaviyoEventsMap';

export { default as createTrackingMiddleware } from './createTrackingMiddleware';
export { default as trackingReducer } from './trackingReducer';
export { default as targets } from './targets';

export const eventsMaps = {
  [TARGET_GTM]: gtmEventsMap,
  [TARGET_KLAVIYO]: klaviyoEventsMap,
};
