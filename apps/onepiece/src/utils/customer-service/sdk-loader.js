// src/utils/customer-service/sdk-loader.js
import { useEffect, useRef, useState } from 'react';

const SCRIPT_ID = 'castlery-cx-sdk-script';

// SDK CDN URLs per environment
const SDK_CDN_URLS = {
  prod: 'https://crxcase-cdn-prod.castlery.com/cx-sdk/v1/customer-service-sdk.js',
  staging: 'https://crxcase-cdn-test.castlery.com/cx-sdk/v1/customer-service-sdk.js',
  uat: 'https://crxcase-cdn-uat.castlery.com/cx-sdk/v1/customer-service-sdk.js',
};

function getSdkEnv() {
  // __APPLICATION_ENV__ values: 'production', 'dev-test', 'dev-staging', 'dev-uat', etc.
  const env = __APPLICATION_ENV__;
  if (env.includes('prod')) return 'prod';
  if (env.includes('uat')) return 'uat';
  return 'staging';
}

function getSdkUrl() {
  return SDK_CDN_URLS[getSdkEnv()] || SDK_CDN_URLS.staging;
}

function getObjectId(value) {
  return value && typeof value === 'object' ? value.id : undefined;
}

function logCustomerServiceSdkInitError(stage, error) {
  console.error('[CustomerService] SDK initialization failed:', {
    error,
    stage,
    sdkUrl: getSdkUrl(),
  });
}

function getGladlyEnv() {
  // Except for staging, all environments are PROD.
  return getSdkEnv() === 'staging' ? 'STAGING' : 'PROD';
}

function getCasaEnv() {
  const sdkEnv = getSdkEnv();
  if (sdkEnv === 'prod') return 'PROD';
  if (sdkEnv === 'uat') return 'UAT';
  return 'STAGING';
}

function getCurrentEnv() {
  return __APPLICATION_ENV__;
}

function resolveCasaConfig() {
  if (window.__CASA_CONFIG__) return window.__CASA_CONFIG__;
  return undefined;
}

function loadSdkScript() {
  if (window.CastleryCustomerService) return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID);
  if (existing && document.head.contains(existing) && !existing.hasAttribute('data-failed')) {
    return new Promise((resolve, reject) => {
      existing.addEventListener(
        'load',
        () => {
          resolve();
        },
        { once: true }
      );
      existing.addEventListener(
        'error',
        () => {
          reject(new Error('SDK script failed'));
        },
        { once: true }
      );
    });
  }

  if (existing) existing.remove();

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = getSdkUrl();
  script.async = true;

  return new Promise((resolve, reject) => {
    script.addEventListener(
      'load',
      () => {
        resolve();
      },
      { once: true }
    );
    script.addEventListener(
      'error',
      () => {
        script.setAttribute('data-failed', 'true');
        reject(new Error('Failed to load Customer Service SDK'));
      },
      { once: true }
    );
    document.head.appendChild(script);
  });
}

let sdkInstance = null;
let sdkInitPromise = null;

function initSdk() {
  if (sdkInstance) return Promise.resolve(sdkInstance);

  return loadSdkScript()
    .catch((error) => {
      logCustomerServiceSdkInitError('load', error);
      throw error;
    })
    .then(() => {
      if (!window.CastleryCustomerService || !window.CastleryCustomerService.init) {
        const error = new Error('CastleryCustomerService.init not available after script load');
        logCustomerServiceSdkInitError('init', error);
        throw error;
      }

      const market = (__COUNTRY__ || 'US').toUpperCase();

      try {
        sdkInstance = window.CastleryCustomerService.init({
          market,
          currentEnv: getCurrentEnv(),
          gladly: {
            appId: `castlery.com-${market.toLowerCase()}`,
            env: getGladlyEnv(),
          },
          casa: {
            env: getCasaEnv(),
            features: {
              addToCart: ({ product, variant, quantity }) => {
                if (!window.clsr?.aiChatUtils) {
                  console.error('[CustomerService] AiChatUtils addToCart unavailable:', {
                    quantity,
                    variantId: getObjectId(variant),
                  });
                  return Promise.reject(new Error('[AiChatUtils Error]: AiChatUtils is not initialized'));
                }
                return window.clsr.aiChatUtils.addToCart({ product, variant, quantity });
              },
              trackEvent: (eventName, eventParams) => {
                if (!window.clsr?.aiChatUtils) {
                  console.error('[CustomerService] AiChatUtils trackEvent unavailable:', {
                    eventName,
                  });
                  return Promise.reject(new Error('[AiChatUtils Error]: AiChatUtils is not initialized'));
                }
                return window.clsr.aiChatUtils.trackEvent(eventName, eventParams);
              },
            },
          },
          whatsapp: {
            url: 'https://wa.me/6582410030',
          },
          autoLoad: false,
          getConfig() {
            return {
              casaConfig: resolveCasaConfig(),
              casaEnvConfig: window.__CASA_ENV_CONFIG__,
            };
          },
        });
      } catch (error) {
        logCustomerServiceSdkInitError('init', error);
        throw error;
      }

      return sdkInstance;
    });
}

function getOrCreateSdk() {
  if (sdkInstance) return Promise.resolve(sdkInstance);
  if (sdkInitPromise) return sdkInitPromise;
  sdkInitPromise = initSdk().catch((err) => {
    sdkInitPromise = null;
    throw err;
  });
  return sdkInitPromise;
}

/**
 * Get the Customer Service SDK API instance.
 * Lazy-initializes on first call. Safe to call from any context.
 * @returns {Promise<CustomerServiceApi>}
 */
export function getCustomerServiceApi() {
  return getOrCreateSdk();
}

/**
 * Get current channel synchronously. Returns null if SDK not yet initialized.
 * @returns {string|null}
 */
export function getCurrentChannelSync() {
  return sdkInstance ? sdkInstance.getCurrentChannel() : null;
}

// --- React Hook ---
export function useCustomerServiceApi() {
  const [customerServiceApi, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const connect = () => {
      getOrCreateSdk()
        .then((instance) => {
          if (!mountedRef.current) return;
          setApi(instance);
          setLoading(false);
        })
        .catch(() => {
          if (!mountedRef.current) return;
          setLoading(false);
        });
    };

    // Only the first bootstrap in the session is deferred to the next frame. Every other mount,
    // or any mount while init is in flight, goes through getOrCreateSdk() only.
    const isColdStart = !sdkInstance && !sdkInitPromise;
    if (!isColdStart) {
      connect();
      return () => {
        mountedRef.current = false;
      };
    }

    let cancelBootstrapTask = () => {};
    if (typeof window.requestAnimationFrame === 'function') {
      const animationFrameId = window.requestAnimationFrame(connect);
      cancelBootstrapTask = () => window.cancelAnimationFrame(animationFrameId);
    } else {
      const timeoutId = window.setTimeout(connect, 0);
      cancelBootstrapTask = () => window.clearTimeout(timeoutId);
    }

    return () => {
      mountedRef.current = false;
      cancelBootstrapTask();
    };
  }, []);

  return { customerServiceApi, loading };
}
