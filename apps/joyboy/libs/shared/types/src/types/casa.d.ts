declare global {
  interface Window {
    __CASA_CONFIG__?: {
      enabled?: boolean;
      supportMarket?: string[];
      version?: string;
      features?: Record<string, any>;
      currentMarket?: string;
      // for future use
      customs?: Record<string, unknown>;
    };
    __CASA_ENV_CONFIG__?: {
      forceEnabled?: string[];
    };
    __CASA_INSTANCE__?: {
      on?: (eventName: string, callback: (data: any) => void) => void;
      off?: (eventName: string, callback?: (data: any) => void) => void;
      openChat?: () => void;
    };
  }
}

export {};
