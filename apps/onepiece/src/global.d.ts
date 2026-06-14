/* eslint-disable @typescript-eslint/naming-convention */
declare const __HOST__: string;
declare const __CLIENT__: boolean;
declare const __SERVER__: boolean;
declare const __TIME_ZONE__: string;
declare const __PLATFORM__: 'mobile' | 'desktop';
declare const __DEVELOPMENT__: boolean;
declare const __DISABLE_SSR__: boolean;
declare const __APPLICATION_ENV__:
  | 'us-prod'
  | 'us-uat'
  | 'us-test'
  | 'au-prod'
  | 'au-uat'
  | 'au-test'
  | 'sg-prod'
  | 'sg-uat'
  | 'sg-test'
  | 'ca-prod'
  | 'ca-uat'
  | 'ca-test'
  | 'uk-prod'
  | 'uk-uat'
  | 'uk-test';
declare const __APP_ENV__:
  | 'us-prod'
  | 'us-uat'
  | 'us-test'
  | 'au-prod'
  | 'au-uat'
  | 'au-test'
  | 'sg-prod'
  | 'sg-uat'
  | 'sg-test'
  | 'ca-prod'
  | 'ca-uat'
  | 'ca-test'
  | 'uk-prod'
  | 'uk-uat'
  | 'uk-test';
declare const __CURRENCY__: string;
declare const __BASE_URL__: string;
declare const __COUNTRY__: 'SG' | 'AU' | 'US' | 'CA' | 'UK';
// TODO 这里可以使用  '/‘ 这种情况吗
declare const __BASE_ROUTE__: '/sg' | '/au' | '/us' | '/ca' | '/uk' | '/';
declare const __FACEBOOK_CLIENT_ID__: string;
declare const __GOOGLE_MAP_API_KEY__: string;
declare const __SENTRY_DSN__: string;
declare const __FULLSTORY_ENABLED__: string;
declare const __APIHOST__: string;
declare const __SERVER_DY_API_KEY__: string;
declare const __CLIENT_DY_API_KEY__: string;
declare const __FRIENDBUY_ENABLED__: string;
declare const __YOTPO_ENABLED__: string;
declare const __REQUEST_TIME_THRESHOLD__: number;
declare const __HEALTH_REQUEST_TIME_THRESHOLD__: number;
declare const __SENTRY_DEBUG__: boolean;

// declare module '*.scss' {
//   const content: {
//     [className: string]: string;
//   };
//   export default content;
// }

// images.d.ts
declare module '*.svg' {
  const content: string;
  export default content;
}
