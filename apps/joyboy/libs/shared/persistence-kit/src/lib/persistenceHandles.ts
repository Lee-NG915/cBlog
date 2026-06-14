/* eslint-disable @typescript-eslint/no-unused-vars */
import { deleteCookie, getCookie, hasCookie, setCookie } from 'cookies-next';
import { MakeCookiesHandleType, OptionsType } from './types';

import { EcEnv } from '@castlery/config';
import {
  accessToken,
  autoAppliedCoupon,
  castleryShop,
  city,
  customerId,
  temporaryCustomerEmail,
  device,
  dyGlobalControlGroup,
  dyid,
  dyidServer,
  dyNewUser,
  dyPageLocation,
  dySession,
  gaClient,
  guestToken,
  hasSubscribed,
  identifyReported,
  ipAddress,
  isLoggedIn,
  isSubscribed,
  modelSwitch,
  noticeSwitch,
  onlineCartSymbol,
  orderNumber,
  plaExperimentVariant,
  preferredLanguage,
  preferredTheme,
  reader,
  refreshToken,
  retailId,
  userCity,
  userInfo,
  webOrderNumber,
  webOrderToken,
  xCartToken,
  posSalesId,
  xCheckoutSessionToken,
  wishItemGuestToken,
  wishlistToken,
  fbp,
  fbc,
  fbUserLoginInfo,
  cookieConsent,
  countryCode,
  fbUser,
  fbcFromClId,
  pdpViewedCountPerSession,
  utmParameters,
  selectedCountryHintHidden,
  xPosCartToken,
  atcSignupTimestamp,
  retailStockLocationType,
  retailDisplayLocationType,
  webTransactionOrderId,
  webTransactionOrderNumber,
  webTransactionSymbol,
  shippingMethodStepConfirmed,
  paymentPageNonZeroVisited,
  idealVacationHomeQuizId,
} from './persistenceName';
import { webAccountChannel } from './persistenceNames/account';

const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000; // 一年的毫秒数

const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000; // 一个月的毫秒数

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 一天的毫秒数
/**
 * @see https://github.com/andreizanik/cookies-next#readme to learn how to use cookies-next in ssr
 * @example
 * ```ts
 * // middleware.ts or api/route.ts
 * const cookies = getCookie('name', { req, res });
 * // server component
 * import {cookies} from "next/headers";
 * const cookies = getCookie('name', { cookies });
 * ```
 */
export const makeCookiesHandle: (keyName: string, autoPrefix?: boolean) => MakeCookiesHandleType = (
  keyName,
  /**
   * @description 是否自动添加前缀,一些第三方脚本种植的cookie没有前缀，比如dyid
   * @default true
   */
  autoPrefix = true
) => {
  // TODO 应该通过 path 来处理的？
  ///
  keyName = autoPrefix ? `${EcEnv.NEXT_PUBLIC_APPLICATION_ENV.toLowerCase()}_${keyName}` : keyName;
  return (
    runtimeOptions = {
      // TODO 到时会影响到 next-auth 的配置
      // path: '/' + EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase(),
    }
  ) => {
    return {
      setItem(value, options = {}) {
        // todo: ts类型error
        // @ts-ignore
        setCookie(keyName, value, {
          expires: new Date(Date.now() + ONE_YEAR_IN_MS),
          secure: true,
          httpOnly: false,
          ...runtimeOptions,
          ...options,
        });
      },
      removeItem(options = {}) {
        // @ts-ignore
        deleteCookie(keyName, {
          ...runtimeOptions,
          ...options,
        });
      },
      getItem(options = {}) {
        // @ts-ignore
        return getCookie(keyName, {
          ...runtimeOptions,
          ...options,
        });
      },
      hasItem(options = {}) {
        // @ts-ignore
        return hasCookie(keyName, {
          ...runtimeOptions,
          ...options,
        });
      },
    };
  };
};

const isServer = typeof window === 'undefined';

const makeLocalStorageHandle = (keyName: string, autoPrefix = true) => {
  keyName = autoPrefix ? `${EcEnv.NEXT_PUBLIC_APPLICATION_ENV.toLowerCase()}_${keyName}` : keyName;
  return () => {
    return {
      setItem(value: string) {
        if (!isServer && localStorage) {
          localStorage.setItem(keyName, value);
        } else {
          // console.error('localStorage is not available : keyName', keyName, 'value', value);
        }
      },

      getItem() {
        if (!isServer && localStorage) {
          return localStorage.getItem(keyName);
        } else {
          // console.error('localStorage is not available : keyName', keyName);
          return '';
        }
      },

      removeItem() {
        if (!isServer && localStorage) {
          localStorage.removeItem(keyName);
        } else {
          // console.error('localStorage is not available : keyName', keyName);
        }
      },
      hasItem() {
        if (!isServer && localStorage) {
          return localStorage.getItem(keyName);
        } else {
          // console.error('localStorage is not available : keyName', keyName);
          return false;
        }
      },
    };
  };
};
const makeSessionStorageHandle = (keyName: string, autoPrefix = true) => {
  keyName = autoPrefix ? `${EcEnv.NEXT_PUBLIC_APPLICATION_ENV.toLowerCase()}_${keyName}` : keyName;
  return () => {
    return {
      setItem(value: string) {
        if (!isServer && sessionStorage) {
          sessionStorage.setItem(keyName, value);
        } else {
          // console.error('sessionStorage is not available : keyName', keyName, 'value', value);
        }
      },

      getItem() {
        if (!isServer && sessionStorage) {
          return sessionStorage.getItem(keyName);
        } else {
          // console.error('sessionStorage is not available : keyName', keyName);
          return '';
        }
      },

      removeItem() {
        if (!isServer && sessionStorage) {
          sessionStorage.removeItem(keyName);
        } else {
          // console.error('sessionStorage is not available : keyName', keyName);
        }
      },
      hasItem() {
        if (!isServer && sessionStorage) {
          return sessionStorage.getItem(keyName);
        } else {
          // console.error('sessionStorage is not available : keyName', keyName);
          return false;
        }
      },
    };
  };
};
// TODO 要来处理类型
export const makePersistenceHandles = (runtimeOptions?: OptionsType) => {
  runtimeOptions = {
    path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}`,
    ...runtimeOptions,
  };
  return {
    /**
     * localStorage
     */
    retailId: makeLocalStorageHandle(retailId)(),
    accessToken: makeLocalStorageHandle(accessToken)(),
    refreshToken: makeLocalStorageHandle(refreshToken)(),
    customerId: makeSessionStorageHandle(customerId)(),
    orderNumber: makeSessionStorageHandle(orderNumber)(),
    readerInfo: makeLocalStorageHandle(reader)(),
    city: makeLocalStorageHandle(city)(),
    onlineCartSymbol: makeLocalStorageHandle(onlineCartSymbol)(),
    autoAppliedCoupon: makeLocalStorageHandle(autoAppliedCoupon)(),
    posSalesId: makeLocalStorageHandle(posSalesId)(),
    fbUserLoginInfo: makeLocalStorageHandle(fbUserLoginInfo)(),
    retailStockLocationType: makeLocalStorageHandle(retailStockLocationType)(),
    retailDisplayLocationType: makeLocalStorageHandle(retailDisplayLocationType)(),
    idealVacationHomeQuizId: makeLocalStorageHandle(idealVacationHomeQuizId, false)(),
    /**
     * sessionStorage
     */
    modelSwitch: makeSessionStorageHandle(modelSwitch)(),
    fbUser: makeSessionStorageHandle(fbUser, false)(),
    utmParameters: makeSessionStorageHandle(utmParameters)(),
    fbcFromClId: makeSessionStorageHandle(fbcFromClId)(),
    temporaryCustomerEmail: makeSessionStorageHandle(temporaryCustomerEmail)(),
    webTransactionOrderId: makeSessionStorageHandle(webTransactionOrderId)(),
    webTransactionOrderNumber: makeSessionStorageHandle(webTransactionOrderNumber)(),
    webTransactionSymbol: makeSessionStorageHandle(webTransactionSymbol)(),
    identifyReported: makeSessionStorageHandle(identifyReported)(),
    /**
     * cookie
     */
    gaClient: makeCookiesHandle(gaClient, false)(),
    isLoggedIn: makeCookiesHandle(isLoggedIn)(runtimeOptions),
    dyid: makeCookiesHandle(dyid, false)({ ...runtimeOptions, path: '/' }),
    dyidServer: makeCookiesHandle(dyidServer, false)({ ...runtimeOptions, path: '/' }),
    dySession: makeCookiesHandle(dySession, false)({ ...runtimeOptions, path: '/' }),
    dyNewUser: makeCookiesHandle(dyNewUser, false)({ ...runtimeOptions, path: '/' }),
    dyPageLocation: makeCookiesHandle(
      dyPageLocation,
      false
    )({ ...runtimeOptions, path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}` }),
    dyGlobalControlGroup: makeCookiesHandle(dyGlobalControlGroup, false)({ ...runtimeOptions, path: '/' }),
    castleryShop: makeCookiesHandle(
      castleryShop,
      false
    )({
      ...runtimeOptions,
      path: '/',
      // 一年后过期
      expires: new Date(Date.now() + ONE_YEAR_IN_MS),
    }),
    preferredLanguage: makeCookiesHandle(preferredLanguage, false)({ ...runtimeOptions }),
    device: makeCookiesHandle(device, false)({ ...runtimeOptions, path: '/' }),
    noticeSwitch: makeCookiesHandle(noticeSwitch, false)({ ...runtimeOptions, path: '/' }),
    preferredTheme: makeCookiesHandle(
      preferredTheme,
      false
    )({
      ...runtimeOptions,
      // 7天
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }),
    wishlistToken: makeCookiesHandle(
      wishlistToken,
      false
    )({ ...runtimeOptions, path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}` }),
    guestToken: makeCookiesHandle(
      guestToken,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
    }),
    wishItemGuestToken: makeCookiesHandle(
      wishItemGuestToken,
      false
    )({ ...runtimeOptions, path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}` }),
    webAccessToken: makeCookiesHandle(
      accessToken,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
    }),
    webRefreshToken: makeCookiesHandle(
      refreshToken,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
    }),
    webOrderId: makeCookiesHandle(
      webOrderNumber,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
    }),
    webOrderToken: makeCookiesHandle(
      webOrderToken,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
    }),
    webCity: makeCookiesHandle(
      city,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
    }),
    webUserCity: makeCookiesHandle(
      userCity,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
    }),
    webCountryCode: makeCookiesHandle(
      countryCode,
      false
    )({
      ...runtimeOptions,
      path: `/`,
    }),
    selectedCountryHintHidden: makeCookiesHandle(
      selectedCountryHintHidden,
      false
    )({
      ...runtimeOptions,
      path: `/`,
      expires: new Date(Date.now() + ONE_MONTH_IN_MS),
    }),
    plaExperimentVariant: makeCookiesHandle(
      plaExperimentVariant,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/pla`,
    }),
    xCartToken: makeCookiesHandle(xCartToken)(runtimeOptions),
    xPosCartToken: makeCookiesHandle(xPosCartToken)({
      ...runtimeOptions,
      expires: new Date(Date.now() + ONE_DAY_IN_MS),
    }),
    // ============ session storage start ============
    xCheckoutSessionToken: makeSessionStorageHandle(xCheckoutSessionToken)(),
    shippingMethodStepConfirmed: makeSessionStorageHandle(shippingMethodStepConfirmed)(),
    paymentPageNonZeroVisited: makeSessionStorageHandle(paymentPageNonZeroVisited)(),

    // ============ session storage end ==============
    ipAddress: makeCookiesHandle(
      ipAddress,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
    }),
    hasSubscribed: makeCookiesHandle(
      hasSubscribed,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
    }),
    isSubscribed: makeCookiesHandle(
      isSubscribed,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }),
    webUserInfo: makeCookiesHandle(
      userInfo,
      false
    )({
      ...runtimeOptions,
      path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`,
    }),
    webAccountChannel: makeCookiesHandle(
      webAccountChannel,
      false
    )({ ...runtimeOptions, path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}` }),
    atcSignupTimestamp: makeCookiesHandle(
      atcSignupTimestamp,
      false
    )({ ...runtimeOptions, expires: new Date(Date.now() + ONE_DAY_IN_MS) }),
    // ================================================================================= //
    // ===== The cookies set by third party sdks or scripts, but set in our domain ===== //
    // ================================================================================= //
    cookieConsent: makeCookiesHandle(cookieConsent, false)({ ...runtimeOptions, path: '/' }),
    fbp: makeCookiesHandle(
      fbp,
      false
    )({ ...runtimeOptions, path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}` }),
    fbc: makeCookiesHandle(
      fbc,
      false
    )({ ...runtimeOptions, path: `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}` }),

    // ================================================================================= //
    // ========================== The cookies set by GTM side ========================== //
    // ================================================================================= //
    pdpViewedCountPerSession: makeCookiesHandle(pdpViewedCountPerSession, false)({ ...runtimeOptions }),
  };
};
