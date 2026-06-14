import { FeatureName } from '../config';
import type { Feature } from '../types';

import yotpo from './yotpo';
import mulberry from './mulberry';
import guardsman from './guardsman';
import stripe from './stripe';
import paypal from './paypal';
import grabPay from './grab-pay';
import afterPay from './after-pay';
import affirm from './affirm';
import zipPay from './zip-pay';
import installment2c2p from './instalment-2c2p';
import fbSign from './facebook-sign-in';
import googleSign from './google-sign-in';
import appleSign from './apple-sign-in';
import gtm from './gtm';
import cookieYes from './cookie-yes';
import uttImpact from './utt-impact';
import uttImpactPos from './utt-impact-pos';
import leadTimeFilter from './lead-time-filter';
import leadtimeDisplay from './leadtime-display';
import quickship from './quickship';
import sustainabilityFeature from './sustainability-feature';

export const FEATURES_CONFIG: Record<keyof typeof FeatureName, Feature> = {
  [FeatureName.YOTPO]: yotpo,
  [FeatureName.MULBERRY]: mulberry,
  [FeatureName.GUARDSMAN]: guardsman,
  [FeatureName.STRIPE]: stripe,
  [FeatureName.PAYPAL]: paypal,
  [FeatureName.GRAB_PAY]: grabPay,
  [FeatureName.AFTER_PAY]: afterPay,
  [FeatureName.AFFIRM]: affirm,
  [FeatureName.ZIP_PAY]: zipPay,
  [FeatureName.INSTALMENT_2C2P]: installment2c2p,
  [FeatureName.FACEBOOK_SIGN_IN]: fbSign,
  [FeatureName.GOOGLE_SIGN_IN]: googleSign,
  [FeatureName.APPLE_SIGN_IN]: appleSign,
  [FeatureName.GTM]: gtm,
  [FeatureName.COOKIE_YES]: cookieYes,
  [FeatureName.UTT_IMPACT]: uttImpact,
  [FeatureName.UTT_IMPACT_POS]: uttImpactPos,
  [FeatureName.LEAD_TIME_FILTER]: leadTimeFilter,
  [FeatureName.LEADTIME_DISPLAY]: leadtimeDisplay,
  [FeatureName.QUICKSHIP]: quickship,
  [FeatureName.SUSTAINABILITY_FEATURE]: sustainabilityFeature,
};
