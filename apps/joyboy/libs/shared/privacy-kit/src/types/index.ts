import { GoogleConsentSchema, CookieYesLoadEventDetail } from './consent.type';

/**
 * Global type declarations for CookieYes
 */
declare global {
  interface Window {
    getCkyConsent: () => CookieYesLoadEventDetail;
  }

  interface WindowEventMap {
    cookieyes_consent_update: CustomEvent;
  }
}

export * from './consent.type';
