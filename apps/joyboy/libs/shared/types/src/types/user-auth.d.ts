declare global {
  interface Window {
    AppleID: any;
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export interface TermsVersion {
  version: string;
  context?: string;
  isAlertUser: boolean;
}

export interface UserTermsVersion {
  accepted_version: string;
  accepted_at?: string;
}

export interface UpdateUserTermsVersionRequest {
  terms_of_use_version: string;
}

export interface UseTermsVersionOptions {
  isNeedAlert?: boolean;
  onConfirm?: (version: string) => void;
  onCancel?: (version: string) => void;
  onClose?: (version: string) => void;
  accessToken?: string;
}

export interface UseTermsVersionReturn {
  checkTermsVersion: (options?: UseTermsVersionOptions) => Promise<void>;
  isLoading: boolean;
}

export {};
