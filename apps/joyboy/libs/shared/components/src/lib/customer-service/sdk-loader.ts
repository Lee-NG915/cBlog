// libs/shared/components/src/lib/customer-service/sdk-loader.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability';
import { registerCustomerServiceClearUser } from '@castlery/shared-services';
import type { CasaConfigLike, CustomerServiceApi, SdkInitOptions } from './sdk-types';
import { Product } from '@castlery/modules-product-domain';
export type { CustomerServiceApi };

// SDK CDN URLs per environment
const SDK_CDN_URLS: Record<string, string> = {
  prod: 'https://crxcase-cdn-prod.castlery.com/cx-sdk/v1/customer-service-sdk.js',
  staging: 'https://crxcase-cdn-test.castlery.com/cx-sdk/v1/customer-service-sdk.js',
  uat: 'https://crxcase-cdn-uat.castlery.com/cx-sdk/v1/customer-service-sdk.js',
};

const SCRIPT_ID = 'castlery-cx-sdk-script';

// Resolve env from NEXT_PUBLIC_APPLICATION_ENV:
//   <country>-prod => prod
//   <country>-uat  => uat
//   <country>-test => staging
function getSdkEnv(): 'prod' | 'staging' | 'uat' {
  const appEnv = EcEnv.NEXT_PUBLIC_APPLICATION_ENV;
  if (appEnv.endsWith('-prod')) return 'prod';
  if (appEnv.endsWith('-uat')) return 'uat';
  return 'staging';
}

function getSdkUrl(): string {
  return SDK_CDN_URLS[getSdkEnv()];
}

function getObjectId(value: unknown): unknown {
  return typeof value === 'object' && value !== null ? (value as { id?: unknown }).id : undefined;
}

function logCustomerServiceSdkInitError(stage: 'load' | 'init', error: unknown): void {
  logger.error('[Customer Service SDK Error]: init failed', {
    error,
    stage,
    sdkUrl: getSdkUrl(),
  });
}

function loadSdkScript(): Promise<void> {
  if (window.CastleryCustomerService) return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing && document.head.contains(existing) && !existing.hasAttribute('data-failed')) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('SDK script failed')), { once: true });
    });
  }

  if (existing) existing.remove();

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = getSdkUrl();
  script.async = true;

  return new Promise<void>((resolve, reject) => {
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener(
      'error',
      () => {
        script.setAttribute('data-failed', 'true');
        reject(new Error('[Customer Service SDK Error]: Failed to load Customer Service SDK'));
      },
      { once: true }
    );
    document.head.appendChild(script);
  });
}

let sdkInstance: CustomerServiceApi | null = null;
let sdkInitPromise: Promise<CustomerServiceApi> | null = null;

function getGladlyEnv(): 'PROD' | 'STAGING' {
  // Except for staging, all environments are PROD
  return getSdkEnv() === 'staging' ? 'STAGING' : 'PROD';
}

function getCasaEnv(): 'PROD' | 'STAGING' | 'UAT' {
  const sdkEnv = getSdkEnv();
  if (sdkEnv === 'prod') return 'PROD';
  if (sdkEnv === 'uat') return 'UAT';
  return 'STAGING';
}

function resolveCasaConfig(): CasaConfigLike | undefined {
  if (window.__CASA_CONFIG__) return window.__CASA_CONFIG__;
  return undefined;
}

export function createCustomerServiceSdkInitOptions(): SdkInitOptions {
  const market = EcEnv.NEXT_PUBLIC_COUNTRY.toUpperCase();

  if (!market) {
    throw new Error('[Customer Service SDK Error]: NEXT_PUBLIC_COUNTRY is not set in the environment');
  }

  return {
    market,
    currentEnv: EcEnv.NEXT_PUBLIC_APPLICATION_ENV,
    gladly: {
      appId: `castlery.com-${market.toLowerCase()}`,
      env: getGladlyEnv(),
    },
    casa: {
      env: getCasaEnv(),
      features: {
        addToCart: ({ product, variant, quantity }: { product: Product; variant: unknown; quantity: number }) => {
          if (!window.clsr?.aiChatUtils) {
            logger.error('[Customer Service SDK Error]: AiChatUtils addToCart unavailable', {
              quantity,
              variantId: getObjectId(variant),
            });
            return Promise.reject(new Error('[AiChatUtils Error]: AiChatUtils is not initialized'));
          }
          return window.clsr.aiChatUtils.addToCart({ product, variant, quantity });
        },
        trackEvent: (eventName: string, eventParams: Record<string, unknown>) => {
          if (!window.clsr?.aiChatUtils) {
            logger.error('[Customer Service SDK Error]: AiChatUtils trackEvent unavailable', {
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
    getConfig: () => ({
      casaConfig: resolveCasaConfig(),
      casaEnvConfig: window.__CASA_ENV_CONFIG__,
    }),
  };
}

async function initSdk(): Promise<CustomerServiceApi> {
  if (sdkInstance) return sdkInstance;

  try {
    await loadSdkScript();
  } catch (error) {
    logCustomerServiceSdkInitError('load', error);
    throw error;
  }

  if (!window.CastleryCustomerService?.init) {
    const error = new Error(
      '[Customer Service SDK Error]: CastleryCustomerService.init not available after script load'
    );
    logCustomerServiceSdkInitError('init', error);
    throw error;
  }

  try {
    sdkInstance = window.CastleryCustomerService.init(createCustomerServiceSdkInitOptions()) as CustomerServiceApi;
  } catch (error) {
    logCustomerServiceSdkInitError('init', error);
    throw error;
  }

  registerCustomerServiceClearUser(() => sdkInstance!.clearUser());

  return sdkInstance;
}

function getOrCreateSdk(): Promise<CustomerServiceApi> {
  if (sdkInstance) return Promise.resolve(sdkInstance);
  if (sdkInitPromise) return sdkInitPromise;
  sdkInitPromise = initSdk().catch((err) => {
    sdkInitPromise = null;
    throw err;
  });
  return sdkInitPromise;
}

// --- Public helper: get SDK API (for non-React code) ---
export async function getCustomerServiceApi(): Promise<CustomerServiceApi> {
  return getOrCreateSdk();
}

// --- Public helper: get current channel synchronously (returns null if not initialized) ---
export function getCurrentChannelSync(): string | null {
  return sdkInstance?.getCurrentChannel() ?? null;
}

// --- React Hook ---
export function useCustomerServiceApi() {
  const [customerServiceApi, setApi] = useState<CustomerServiceApi | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const connect = () => {
      void getOrCreateSdk()
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
    // or any mount while init is in flight, goes through getOrCreateSdk() only — same as
    // getCustomerServiceApi() / other callers.
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
