interface _learnq {
  push: (...args: any[]) => Promise<void>;
  track: (event: string, properties?: Object) => Promise<boolean>;
  identify: (properties: Object) => Promise<object>;
  openForm: (formId: string) => Promise<void>;
}

interface ProsuroWidgetPlan {
  id: string;
  text: string;
  price: number;
  term: number;
  providerSku: string;
  offerId: string;
}

interface ProsuroWidgetProductResponse {
  success: boolean;
  plans: ProsuroWidgetPlan[];
  planType?: string;
}

interface ProsuroWidgetCartLine {
  lineId: string;
  productId: string;
  price: number;
}

interface ProsuroWidgetCartItem {
  lineId: string;
  isEligible: boolean;
  plans: ProsuroWidgetPlan[];
  message?: string;
}

interface ProsuroWidgetCartResponse {
  success: boolean;
  items: ProsuroWidgetCartItem[];
}

interface ProsuroWidgetOpenResponse {
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
declare global {
  _learnq;
  interface Window {
    clsr: {
      aiChatUtils?: any;
    };
    historyPageviews: Array<{ event: string; [property: string]: any }>;
    DY: {
      dyid: string;
      session: string;
      API: (...args: any[]) => void;
      recommendationContext?: {
        type: 'HOMEPAGE' | 'CATEGORY' | 'PRODUCT' | 'CART' | 'OTHER';
        data: string | string[];
      };
      ServerUtil: {
        getProductsData: (
          skus: string[],
          arg1: any[],
          arg2: string,
          arg3: boolean,
          callback: (err: any, res: any) => void
        ) => void; // eslint-disable-next-line @typescript-eslint/no-explicit-any
      };
    };
    DYO: {
      dyhash: {
        sha256: (email: string) => string;
      };
    };
    dataLayer: Array<{ event: string; [property: string]: any }>;
    _learnq: _learnq;
    mulberry: {
      core: {
        init: (payload: { publicToken: string }) => Promise<void>;
        getWarrantyOffer: (payload: MulberryPayload) => Promise<WarrantyOffer[]>;
        settings?: any;
      };
      inline?: {
        instances?: Array<{
          postMessageClient: {
            listeners: Array<{
              key: string;
              fn: (settings: any) => void;
            }>;
          };
        }>;
        init?: (config: { offers: WarrantyOffer[]; settings: any; selector: string }) => Promise<void>;
      };
      modal?: {
        init: (config: {
          offers: WarrantyOffer[];
          settings: any;
          onWarrantySelect: (warranty: any) => Promise<void>;
        }) => Promise<void>;
      };
    };
    ProsuroWidget?: {
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
    };
    HIntegrate: {
      getProductInExperience: (experienceLabel: string, productId: string) => Promise<any>;
      initialiseExperience: (folder: string, selector: string) => void;
      checkStartupHullabalook: () => void;
    };
  }
}

export {};
