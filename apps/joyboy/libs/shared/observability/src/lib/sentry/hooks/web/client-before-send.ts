import * as Sentry from '@sentry/nextjs';
import {
  classifyErrorBucket,
  CRITICAL_THIRD_PARTY_PATTERNS,
  ERROR_BUCKET,
  isCasaCustomerServiceError,
  isOwnApplicationStackFrame,
} from '../../errors/error-bucket';
import { BUSINESS_DOMAIN } from '../../../monitoring/domains';
import { PAGE_TYPES } from '../../../monitoring/page-types';

export interface BeforeSendDeps {
  userAgent: string;
  isOnline: boolean;
  language: string;
  locationHref: string;
  logDebug: (msg: string, extra?: Record<string, unknown>) => void;
}

function toSafeMessage(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

export function clientBeforeSend(
  event: Sentry.ErrorEvent,
  hint: Sentry.EventHint,
  deps: BeforeSendDeps
): Sentry.ErrorEvent | null {
  const error = hint.originalException;
  const errorMessage = toSafeMessage(event.message);
  const normalizedErrorMessage = errorMessage.toLowerCase();
  const exceptionMessages = (event.exception?.values || [])
    .map((value) => [value.type, value.value].filter(Boolean).join(': '))
    .filter(Boolean)
    .join(' | ');
  const combinedErrorMessage = [errorMessage, exceptionMessages].filter(Boolean).join(' | ');
  const normalizedCombinedErrorMessage = combinedErrorMessage.toLowerCase();
  const userAgent = deps.userAgent || '';
  const exception = event.exception?.values?.[0];
  const stacktrace = exception?.stacktrace;
  const frames = stacktrace?.frames || [];
  const hasRecaptchaFrame = frames.some((frame) => {
    const filename = frame.filename || '';
    return (
      filename.includes('recaptcha/releases/') ||
      filename.includes('recaptcha__') ||
      filename.includes('app:///recaptcha')
    );
  });

  const responseCtx = (event.contexts as { response?: { status_code?: number } } | undefined)?.response;
  const statusCode =
    responseCtx?.status_code ??
    (event.extra as { response?: { status?: number } })?.response?.status ??
    (error as { status?: number } | null)?.status;
  const mechanism = event.exception?.values?.[0]?.mechanism;
  const isExplicitCapture = mechanism?.handled === true && mechanism?.type === 'generic';
  const { error_bucket, bucket_confidence } = classifyErrorBucket({
    message: combinedErrorMessage || exception?.value || errorMessage || '',
    errorName: (error as Error)?.name,
    frames: frames.map((f) => ({ filename: f.filename })),
    statusCode,
    isExplicitCapture,
  });
  if (!event.tags) event.tags = {};
  event.tags['error_bucket'] = error_bucket;
  event.tags['bucket_confidence'] = bucket_confidence;

  const isCasaSdkError = isCasaCustomerServiceError({
    message: combinedErrorMessage,
    frames: frames.map((f) => ({ filename: f.filename })),
  });

  if (isCasaSdkError) {
    deps.logDebug('Sentry: Ignoring Casa customer service SDK error; Casa SDK reports to its own Sentry:', {
      errorMessage: combinedErrorMessage,
    });
    return null;
  }

  if (errorMessage.includes('Maximum call stack') || errorMessage.includes('call stack size exceeded')) {
    const isKlaviyoError = frames.some((frame) => {
      const filename = frame.filename || '';
      const functionName = frame.function || '';
      return (
        filename.includes('klaviyo') || functionName.includes('_learnq') || functionName.includes('window._learnq')
      );
    });

    if (isKlaviyoError || errorMessage.includes('_learnq') || errorMessage.includes('klaviyo')) {
      deps.logDebug('Sentry: Ignoring Klaviyo stack overflow error:', { errorMessage });
      return null;
    }
  }

  if (exception && !stacktrace?.frames?.length) {
    deps.logDebug('Sentry: Ignoring error without stack trace:', { errorMessage });
    return null;
  }

  const extraData = (event.extra as { arguments?: unknown[] } | undefined)?.arguments?.[0] as
    | { type?: string }
    | undefined;
  const eventUrl =
    event.request?.url || (typeof event.tags?.['url'] === 'string' ? event.tags['url'] : '') || deps.locationHref || '';
  const isGoogleTranslateFrame = frames.some((frame) => {
    const filename = frame.filename || '';
    return filename.includes('translate_http') || filename.includes('translate.goog');
  });
  const isGoogleTranslateProxy = eventUrl.includes('translate.goog');
  const isGoogleTranslatePopupEvent = extraData?.type === 'goog-gt-popupShown';
  const isBeforeUnloadEvent = extraData?.type === 'beforeunload' || extraData?.type === 'unload';

  if (
    (isGoogleTranslateFrame || isGoogleTranslateProxy || isGoogleTranslatePopupEvent) &&
    (errorMessage.includes('null is not an object') || errorMessage.includes('setAttribute'))
  ) {
    deps.logDebug('Sentry: Ignoring Google Translate DOM mutation error:', {
      errorMessage,
      eventUrl,
      eventType: extraData?.type,
    });
    return null;
  }

  const isAffirmRegistrationRequest = eventUrl.includes('features.affirm.com/v1/rgstr');
  const isAffirmFrame = frames.some((frame) => {
    const filename = frame.filename || '';
    return filename.includes('affirm.js');
  });

  const isAffirmPdpNoise =
    event.tags?.['page_type'] === PAGE_TYPES.PDP && event.tags?.['domain'] === BUSINESS_DOMAIN.PRODUCT;

  if (isAffirmRegistrationRequest && isAffirmFrame && statusCode === 500 && isAffirmPdpNoise) {
    deps.logDebug('Sentry: Ignoring Affirm PDP registration 500:', {
      errorMessage,
      eventUrl,
      statusCode,
    });
    return null;
  }

  if (isBeforeUnloadEvent) {
    if (
      normalizedCombinedErrorMessage.includes('java object is gone') ||
      normalizedCombinedErrorMessage.includes('enabledidusertypeonkeyboardlogging') ||
      normalizedCombinedErrorMessage.includes('error invoking')
    ) {
      deps.logDebug('Sentry: Ignoring WebView Java bridge error during page unload:', { errorMessage });
      return null;
    }

    if (
      normalizedCombinedErrorMessage.includes('synchronous xhr in page dismissal') ||
      normalizedCombinedErrorMessage.includes("failed to execute 'send' on 'xmlhttprequest'")
    ) {
      deps.logDebug('Sentry: Ignoring synchronous XHR error during page dismissal:', { errorMessage });
      return null;
    }
  }

  const hasFacebookIabUserAgent = /FBAN|FBAV/i.test(userAgent);
  const isIabJsUnifiedBridgeError =
    normalizedCombinedErrorMessage.includes('iabjs_unified_bridge') ||
    normalizedCombinedErrorMessage.includes('__call_iabjs_unified_bridge');

  if (hasFacebookIabUserAgent && isIabJsUnifiedBridgeError) {
    deps.logDebug('Sentry: Ignoring Facebook IAB unified bridge error:', {
      errorMessage,
      userAgent,
    });
    return null;
  }

  const isCriticalThirdParty = frames.some((frame) => {
    const filename = (frame.filename || '').toLowerCase();
    return CRITICAL_THIRD_PARTY_PATTERNS.some((service) => filename.includes(service));
  });

  const networkErrors = ['Load failed', 'Network request failed', 'Failed to fetch', 'NetworkError'];
  if (networkErrors.some((pattern) => normalizedCombinedErrorMessage.includes(pattern.toLowerCase()))) {
    if (deps.isOnline === false) {
      deps.logDebug('Sentry: Ignoring network error (user offline):', { errorMessage: combinedErrorMessage });
      return null;
    }

    const isMulberryError = frames.some((frame) => {
      const filename = frame.filename || '';
      return filename.includes('mulberry') || filename.includes('getmulberry');
    });

    if (isMulberryError) {
      const isUnloadEvent =
        extraData?.type === 'unload' ||
        extraData?.type === 'beforeunload' ||
        errorMessage.includes('unload') ||
        errorMessage.includes('page dismissal') ||
        errorMessage.includes('Synchronous XHR in page dismissal');

      if (isUnloadEvent) {
        deps.logDebug('Sentry: Ignoring Mulberry network error during page unload:', { errorMessage });
        return null;
      }
    }

    if (error_bucket === ERROR_BUCKET.THIRD_PARTY && !isCriticalThirdParty) {
      deps.logDebug('Sentry: Ignoring non-critical third-party network error (bucket=third_party):', {
        errorMessage,
      });
      return null;
    }
  }

  if (errorMessage === 'Script error.' && error_bucket === ERROR_BUCKET.THIRD_PARTY && !isCriticalThirdParty) {
    deps.logDebug('Sentry: Ignoring non-critical Script error. from third-party (bucket=third_party):', {
      errorMessage,
    });
    return null;
  }

  const isWidgetAssetsError = frames.some((frame) => {
    const filename = frame.filename || '';
    return (
      filename.includes('widget-assets/') ||
      filename.includes('widget-loyalty-campaigns/') ||
      filename.includes('widgets-initializer/') ||
      filename.includes('app:///widget-assets') ||
      filename.includes('app:///widget-loyalty-campaigns') ||
      filename.includes('app:///widgets-initializer')
    );
  });

  if (isWidgetAssetsError) {
    const isKnownWidgetError =
      errorMessage.includes('null is not an object') ||
      errorMessage.includes('appendChild') ||
      (errorMessage.includes('Cannot read propert') &&
        (errorMessage.includes('appendChild') || errorMessage.includes('innerHTML')));

    const isReferralWidgetError = frames.some((frame) => {
      const filename = frame.filename || '';
      return (
        filename.includes('widget-referral-widget') &&
        errorMessage.includes('Cannot read properties of undefined') &&
        errorMessage.includes('trackShown')
      );
    });

    const isReferredFriendError = frames.some((frame) => {
      const filename = frame.filename || '';
      return filename.includes('widget-referred-friend') && errorMessage === 'custom is not supported';
    });

    if (isKnownWidgetError || isReferralWidgetError || isReferredFriendError) {
      deps.logDebug('Sentry: Ignoring third-party widget-assets error:', {
        errorMessage,
        firstFrame: frames[0]?.filename || '',
      });
      return null;
    }
  }

  if (normalizedErrorMessage.includes('recaptcha timeout') && hasRecaptchaFrame) {
    deps.logDebug('Sentry: Ignoring reCAPTCHA timeout from third-party script:', { errorMessage });
    return null;
  }

  const hasOwnCode = frames.some((frame) => isOwnApplicationStackFrame(frame.filename || ''));

  if (!hasOwnCode && !isCriticalThirdParty && frames.length > 0) {
    const firstFrame = frames[0]?.filename || '';
    deps.logDebug('Sentry: Ignoring error from third-party code only:', { firstFrame });
    return null;
  }

  if (isCriticalThirdParty && !hasOwnCode) {
    if (!event.tags) event.tags = {};
    event.tags['criticalThirdParty'] = 'yes';
    deps.logDebug('Sentry: KEEPING critical third-party error:', { errorMessage });
  }

  const mobileAppPatterns = [/FBAN|FBAV/i, /Instagram/i, /Line\//i, /MicroMessenger/i];

  if (mobileAppPatterns.some((pattern) => pattern.test(userAgent))) {
    const mobileNoiseErrors = [/TypeError.*Load failed/i, /.*facebook.*/i, /.*instagram.*/i, /webkit/i];
    if (mobileNoiseErrors.some((pattern) => pattern.test(errorMessage))) {
      deps.logDebug('Sentry: Ignoring mobile app browser error:', { errorMessage, userAgent });
      return null;
    }
  }

  if ((error as Error)?.name === 'AbortError' || errorMessage.includes('abort')) {
    deps.logDebug('Sentry: Ignoring aborted request:', { errorMessage });
    return null;
  }

  if (error_bucket === ERROR_BUCKET.API_TIMEOUT && !hasOwnCode && !isCriticalThirdParty) {
    deps.logDebug('Sentry: Ignoring third-party timeout:', { errorMessage });
    return null;
  }

  if (errorMessage.includes('null is not an object') && !hasOwnCode && !isCriticalThirdParty) {
    deps.logDebug('Sentry: Ignoring third-party null error:', { errorMessage });
    return null;
  }

  if (
    (errorMessage.includes('undefined is not an object') || errorMessage.includes('undefined is not a function')) &&
    !hasOwnCode &&
    !isCriticalThirdParty
  ) {
    deps.logDebug('Sentry: Ignoring third-party undefined error:', { errorMessage });
    return null;
  }

  if (errorMessage.includes('Cannot read propert') && !hasOwnCode && !isCriticalThirdParty) {
    deps.logDebug('Sentry: Ignoring third-party read property error:', { errorMessage });
    return null;
  }

  if (errorMessage.toLowerCase().includes('cross-origin') && !hasOwnCode && !isCriticalThirdParty) {
    deps.logDebug('Sentry: Ignoring third-party CORS error:', { errorMessage });
    return null;
  }

  const thirdPartyPatterns = [
    /mutation\.target\.matches/i,
    /api_static\.js/i,
    /frame_ant/i,
    /inject_content/i,
    /translate_http/i,
    /MetaMask/i,
    /extensionAPIBridge/i,
  ];

  if (thirdPartyPatterns.some((pattern) => pattern.test(errorMessage)) && !hasOwnCode && !isCriticalThirdParty) {
    deps.logDebug('Sentry: Ignoring known third-party error pattern:', { errorMessage });
    return null;
  }

  if (userAgent.includes('HeadlessChrome')) {
    deps.logDebug('Sentry: Ignoring error from HeadlessChrome (bot/crawler):', { errorMessage });
    return null;
  }

  if (
    errorMessage.includes('messageHandlers') ||
    errorMessage.includes('window.webkit.messageHandlers') ||
    (errorMessage.includes('webkit') && errorMessage.includes('undefined is not an object'))
  ) {
    deps.logDebug('Sentry: Ignoring webkit.messageHandlers error:', { errorMessage });
    return null;
  }

  if (
    errorMessage.includes('JavascriptInterface') ||
    errorMessage.includes('PerformanceMonitoringJavascriptInterface')
  ) {
    deps.logDebug('Sentry: Ignoring Android WebView JavascriptInterface error:', { errorMessage });
    return null;
  }

  const mobileBrowsers = ['Instagram', 'Google', 'Facebook'];
  const browserName = event.tags?.['browser.name'] || event.request?.headers?.['User-Agent'] || '';
  if (mobileBrowsers.some((name) => String(browserName).includes(name))) {
    if (errorMessage.includes('webkit')) {
      deps.logDebug('Sentry: Ignoring webkit error in mobile app browser:', { browserName: String(browserName) });
      return null;
    }
    if (errorMessage.includes('Maximum call stack')) {
      deps.logDebug('Sentry: Ignoring stack overflow in mobile app browser:', { browserName: String(browserName) });
      return null;
    }
  }

  if (event.tags) {
    event.tags['userAgent'] = userAgent;
    event.tags['onlineStatus'] = deps.isOnline ? 'online' : 'offline';
    event.tags['hasOwnCode'] = hasOwnCode ? 'yes' : 'no';
  }

  if (!event.contexts) {
    event.contexts = {};
  }
  event.contexts['browser'] = {
    userAgent,
    online: deps.isOnline,
    language: deps.language,
    name: event.tags?.['browser.name'] || '',
  };

  return event;
}
