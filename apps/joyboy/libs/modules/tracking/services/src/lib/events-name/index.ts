import { DY_EVENTS_NAME } from './dy-events-name';
import { GA_EVENTS_NAME } from './ga-events-name';
import { FB_CAPI_EVENTS_NAME } from './facebook-events-name';
import { PINTEREST_CAPI_EVENTS_NAME } from './pinterest-events-name';
import { KLAVIYO_EVENTS_NAME } from './klaviyo-events-name';
import { UTT_EVENTS_NAME } from './utt-events-name';

export const EVENTS_NAMES_MAP = {
  ...DY_EVENTS_NAME,
  ...GA_EVENTS_NAME,
  ...FB_CAPI_EVENTS_NAME,
  ...PINTEREST_CAPI_EVENTS_NAME,
  ...KLAVIYO_EVENTS_NAME,
  ...UTT_EVENTS_NAME,
};
