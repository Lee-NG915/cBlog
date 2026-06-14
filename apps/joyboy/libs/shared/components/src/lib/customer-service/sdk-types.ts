// libs/shared/components/src/lib/customer-service/sdk-types.ts
// Type declarations for the Customer Service SDK loaded from CDN.
// These mirror the SDK's public API types defined in psa/src/customer-service-sdk/types.ts.

export type ChannelName = 'casa' | 'gladly' | 'whatsapp';
export type ChannelState = 'unloaded' | 'loading' | 'ready' | 'open' | 'failed';

export interface CustomerUser {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CasaFeatures {
  login?: () => void;
  addToCart?: (params: { product: any; variant: any; quantity: number }) => Promise<any>;
  trackEvent?: (eventName: string, eventParams: { [key: string]: any }) => Promise<any>;
}

export interface CasaInitConfig {
  env: 'PROD' | 'STAGING' | 'UAT';
  features?: CasaFeatures;
}

export interface GladlyInitConfig {
  appId: string;
  env: 'PROD' | 'STAGING';
}

export interface WhatsAppInitConfig {
  url: string;
}

export interface CasaConfigLike {
  enabled?: boolean;
  supportMarket?: string[];
  version?: string;
  currentMarket?: string;
  // TODO: maybe don't need it in the future, because init options already has features
  features?: Record<string, unknown>;
  customs?: Record<string, unknown>;
}

export interface CasaEnvConfigLike {
  forceEnabled?: string[];
}

export interface SdkInitOptions {
  market: string;
  currentEnv?: string;
  getConfig: () => {
    casaConfig?: CasaConfigLike;
    casaEnvConfig?: CasaEnvConfigLike;
  };
  getUser?: () => CustomerUser | null;
  firstScreenStableSignal?: Promise<void>;
  casa?: CasaInitConfig;
  gladly?: GladlyInitConfig;
  whatsapp?: WhatsAppInitConfig;
  telemetry?: {
    track?: (eventName: string, payload?: Record<string, unknown>) => void;
  };
  autoLoad?: boolean;
}

export type HandoffReason = 'handoff-requested' | 'runtime-error' | 'load-failed';

export interface CustomerServiceEventMap {
  ready: { defaultChannel: ChannelName };
  channel_changed: { from: ChannelName | null; to: ChannelName };
  channel_opened: { channel: ChannelName };
  channel_closed: { channel: ChannelName };
  user_synced: { channel: ChannelName; hasUser: boolean };
  error: { channel?: ChannelName; stage: 'init' | 'load' | 'runtime' | 'handoff'; error: unknown };
}

export interface CustomerServiceApi {
  openChat(): Promise<void>;
  closeChat(): Promise<void>;
  setUser(user: CustomerUser | null): Promise<void>;
  clearUser(): Promise<void>;
  getCurrentChannel(): ChannelName | null;
  on<T extends keyof CustomerServiceEventMap>(
    event: T,
    listener: (payload: CustomerServiceEventMap[T]) => void
  ): () => void;
}

export interface CastleryCustomerServiceGlobal {
  init: (options: SdkInitOptions) => CustomerServiceApi;
}

declare global {
  interface Window {
    CastleryCustomerService?: CastleryCustomerServiceGlobal;
  }
}
