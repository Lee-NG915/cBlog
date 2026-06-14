import { EcEnv } from './ec-env';

export interface ProsuroWidgetPlan {
  id: string;
  text: string;
  price: number;
  term: number;
  providerSku: string;
  offerId: string;
}

export interface ProsuroWidgetProductResponse {
  success: boolean;
  plans: ProsuroWidgetPlan[];
  planType?: string;
}

export interface ProsuroWidgetCartLine {
  lineId: string;
  productId: string;
  price: number;
}

export interface ProsuroWidgetCartItem {
  lineId: string;
  isEligible: boolean;
  plans: ProsuroWidgetPlan[];
  message?: string;
  requestedProductId?: string;
  requestedPrice?: number;
}

export interface ProsuroWidgetCartResponse {
  success: boolean;
  items: ProsuroWidgetCartItem[];
}

export interface ProsuroWidgetOpenResponse {
  added?: boolean;
  declined?: boolean;
  plan?: {
    id?: string;
    planId?: string;
    offerId: string;
    providerSku: string;
    price: number;
    term: number;
  };
}

export interface ProsuroWidgetApi {
  init: (payload: {
    publicKey: string;
    productId?: string;
    currentPrice?: number;
    variantId?: string;
  }) => Promise<void>;
  cart: (cartLines: ProsuroWidgetCartLine[]) => Promise<ProsuroWidgetCartResponse>;
  open: (productId: string, price: number) => Promise<ProsuroWidgetOpenResponse>;
  product: (
    productId: string,
    price: number,
    options?: {
      variantId?: string;
      productTitle?: string;
      productDescription?: string;
    }
  ) => Promise<ProsuroWidgetProductResponse>;
}

const getProsuroWidget = (): ProsuroWidgetApi | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return (window as unknown as { ProsuroWidget?: ProsuroWidgetApi }).ProsuroWidget;
};

const waitForProsuroWidget = async (timeoutMs = 15000): Promise<ProsuroWidgetApi | undefined> => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const widget = getProsuroWidget();
  if (widget) {
    return widget;
  }

  return new Promise((resolve) => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const nextWidget = getProsuroWidget();
      if (nextWidget || Date.now() - startedAt >= timeoutMs) {
        window.clearInterval(timer);
        resolve(nextWidget);
      }
    }, 50);
  });
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> => {
  if (typeof window === 'undefined') {
    return promise;
  }

  let timer: number | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) {
      window.clearTimeout(timer);
    }
  }
};

export type WarrantyProvider = 'mulberry' | 'guardsman' | null;

export interface WarrantyRuntimeConfig {
  provider: WarrantyProvider;
  mulberry?: {
    publicToken: string;
    sdkUrl?: string;
  };
  guardsman?: {
    publicKey: string;
  };
}

export interface GuardsmanProductRequest {
  productId: string;
  price: number;
  options?: {
    variantId?: string;
    productTitle?: string;
    productDescription?: string;
  };
}

const DEFAULT_GUARDSMAN_PUBLIC_KEY = 'j97d8s9sfsd94v6g44dg5h3h6n7s50az';
const DEFAULT_GUARDSMAN_WIDGET_SDK = 'https://cdn-sandbox.prosuro.com/widget.js';

let guardsmanScriptLoadPromise: Promise<void> | null = null;
let guardsmanInitPromise: Promise<void> | null = null;

export const getGuardsmanRuntimeConfig = () => {
  return {
    publicKey: EcEnv.NEXT_PUBLIC_GUARDSMAN_PUBLIC_KEY || DEFAULT_GUARDSMAN_PUBLIC_KEY,
    sdkUrl: EcEnv.NEXT_PUBLIC_GUARDSMAN_WIDGET_SDK || DEFAULT_GUARDSMAN_WIDGET_SDK,
  };
};

export const getWarrantyRuntimeConfig = (provider: WarrantyProvider): WarrantyRuntimeConfig => {
  if (provider === 'guardsman') {
    return {
      provider,
      guardsman: getGuardsmanRuntimeConfig(),
    };
  }

  if (provider === 'mulberry') {
    return {
      provider,
      mulberry: {
        publicToken: EcEnv.NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN || '',
        sdkUrl: EcEnv.NEXT_PUBLIC_MULBERRY_SDK,
      },
    };
  }

  return {
    provider: null,
  };
};

const loadGuardsmanWidgetScript = async () => {
  if (typeof window === 'undefined' || typeof document === 'undefined' || getProsuroWidget()) {
    return;
  }

  if (!guardsmanScriptLoadPromise) {
    guardsmanScriptLoadPromise = new Promise<void>((resolve, reject) => {
      const scriptId = 'guardsman-widget-script';
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (existingScript) {
        if (getProsuroWidget()) {
          resolve();
          return;
        }

        const startedAt = Date.now();
        const timer = window.setInterval(() => {
          if (getProsuroWidget() || Date.now() - startedAt >= 15000) {
            window.clearInterval(timer);
            resolve();
          }
        }, 50);
        return;
      }

      const { sdkUrl } = getGuardsmanRuntimeConfig();
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = sdkUrl;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Guardsman widget script'));
      document.head.appendChild(script);
    }).catch((error) => {
      guardsmanScriptLoadPromise = null;
      throw error;
    });
  }

  await guardsmanScriptLoadPromise;
};

export const initializeGuardsmanWidget = async () => {
  await loadGuardsmanWidgetScript();

  const widget = await waitForProsuroWidget();
  if (!widget) {
    return undefined;
  }

  if (!guardsmanInitPromise) {
    const { publicKey } = getGuardsmanRuntimeConfig();
    guardsmanInitPromise = withTimeout(
      Promise.resolve(
        widget.init({
          publicKey,
        })
      ),
      10000,
      'Guardsman widget init timed out'
    ).catch((error) => {
      guardsmanInitPromise = null;
      throw error;
    });
  }

  await guardsmanInitPromise;
  return widget;
};

export const fetchGuardsmanProductPlans = async ({ productId, price, options }: GuardsmanProductRequest) => {
  const widget = await initializeGuardsmanWidget();
  if (!widget) {
    return null;
  }

  return withTimeout(widget.product(productId, price, options), 15000, 'Guardsman product discovery timed out');
};

export const fetchGuardsmanCartPlans = async (cartLines: ProsuroWidgetCartLine[]) => {
  const widget = await initializeGuardsmanWidget();
  if (!widget) {
    return null;
  }

  return withTimeout(widget.cart(cartLines), 15000, 'Guardsman cart discovery timed out');
};

export const openGuardsmanWidget = async ({
  productId,
  price,
  onOpen,
}: {
  productId: string;
  price: number;
  onOpen?: () => void;
}) => {
  const widget = await initializeGuardsmanWidget();
  if (!widget) {
    return null;
  }

  const result = await widget.open(productId, price);
  onOpen?.();
  return result;
};
