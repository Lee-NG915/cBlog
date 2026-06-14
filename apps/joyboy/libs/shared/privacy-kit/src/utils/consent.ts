import { EcEnv, EC_COUNTRIES_ENUM } from '@castlery/config';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import {
  GoogleConsentSchema,
  CookieYesConsentSchema,
  CookieYesConsentStatusSchema,
  CookieYesConsentStatus,
  CookieYesLoadEventDetail,
  CookieYesConsentCategories,
} from '../types';
import { logger } from '@castlery/observability/client';

export const DEFAULT_GRANTED_CKY_CONSENT_CONFIG: CookieYesConsentSchema = {
  necessary: 'yes',
  functional: 'yes',
  analytics: 'yes',
  performance: 'yes',
  advertisement: 'yes',
  other: 'yes',
};

export const DEFAULT_DENIED_CKY_CONSENT_CONFIG: CookieYesConsentSchema = {
  necessary: 'yes', // necessary is always granted
  functional: 'no',
  analytics: 'no',
  performance: 'no',
  advertisement: 'no',
  other: 'no',
};

/**
 * Regions that require consent by default (GDPR, etc.)
 */
export const DEFAULT_DENIED_REGIONS: string[] = [EC_COUNTRIES_ENUM.Enum.CA, EC_COUNTRIES_ENUM.Enum.UK];

/**
 * Check if the given region requires consent by default
 * @param region - The region/country code to check
 * @returns boolean indicating if consent is denied by default
 */
export function isDefaultDeniedRegion(region: string): boolean {
  return DEFAULT_DENIED_REGIONS.includes(region.toUpperCase());
}

export const mappingCKYConsentToGoogleConsent = (ckyConsent: CookieYesConsentSchema): GoogleConsentSchema => {
  return {
    ad_storage: ckyConsent.advertisement === 'yes' ? 'granted' : 'denied',
    ad_user_data: ckyConsent.advertisement === 'yes' ? 'granted' : 'denied',
    ad_personalization: ckyConsent.advertisement === 'yes' ? 'granted' : 'denied',
    analytics_storage: ckyConsent.analytics === 'yes' ? 'granted' : 'denied',
    functionality_storage: ckyConsent.functional === 'yes' ? 'granted' : 'denied',
    personalization_storage: ckyConsent.functional === 'yes' ? 'granted' : 'denied',
    security_storage: ckyConsent.necessary === 'yes' ? 'granted' : 'denied',
  };
};

export const getDefaultRegionalGoogleConsentMapping = (region: string): GoogleConsentSchema => {
  return isDefaultDeniedRegion(region)
    ? mappingCKYConsentToGoogleConsent(DEFAULT_DENIED_CKY_CONSENT_CONFIG)
    : mappingCKYConsentToGoogleConsent(DEFAULT_GRANTED_CKY_CONSENT_CONFIG);
};

/**
 * Parse consent status from cookie value
 * @param category - The category to check
 * @param cookieValue - The cookie value string
 * @returns boolean indicating if consent is granted
 */
export function parseConsentFromCookie(consentCookie: string): null | CookieYesConsentSchema {
  if (!consentCookie) return null;

  const consentValues = consentCookie.split(',').reduce<CookieYesConsentSchema>((acc, pairString) => {
    const [key, value] = pairString.split(':');
    if (key && value) {
      acc[key.trim() as keyof CookieYesConsentSchema] = value.trim() as CookieYesConsentStatus;
    }
    return acc;
  }, {} as CookieYesConsentSchema);
  return consentValues;
}

export const getCKYConsentCookieValues = (): CookieYesConsentSchema | null => {
  const consentCookie = makePersistenceHandles().cookieConsent.getItem() || '';
  if (!consentCookie) return null;
  return parseConsentFromCookie(consentCookie);
};

/**
 * Get all consent statuses
 * Tries to use getCkyConsent from window first, falls back to cookie parsing
 * @returns ConsentStatus object with all categories
 */
export function getActualCkyConsent(): CookieYesConsentStatusSchema {
  if (typeof window !== 'undefined') {
    // Try to use getCkyConsent if available
    const getCkyConsent = (window as any).getCkyConsent;
    if (typeof getCkyConsent === 'function') {
      try {
        const consent = window.getCkyConsent() as CookieYesLoadEventDetail;
        const categories = consent.categories;
        if (categories && Object.keys(categories).length > 0) {
          return categories;
        }
      } catch (error) {
        logger.error('Error getting consent via getCkyConsent:', { error });
      }
    }
  }

  // Fall back to cookie parsing
  if (typeof window !== 'undefined') {
    const consentValues = getCKYConsentCookieValues();
    if (consentValues && Object.keys(consentValues).length > 0) {
      return {
        necessary: consentValues.necessary === 'yes',
        functional: consentValues.functional === 'yes',
        analytics: consentValues.analytics === 'yes',
        performance: consentValues.performance === 'yes',
        advertisement: consentValues.advertisement === 'yes',
        other: consentValues.other ? consentValues.other === 'yes' : false,
      };
    }
  }

  // Default: use default consent config based on region
  const defaultConsent = isDefaultDeniedRegion(EcEnv.NEXT_PUBLIC_COUNTRY)
    ? DEFAULT_DENIED_CKY_CONSENT_CONFIG
    : DEFAULT_GRANTED_CKY_CONSENT_CONFIG;
  return {
    necessary: defaultConsent.necessary === 'yes',
    functional: defaultConsent.functional === 'yes',
    analytics: defaultConsent.analytics === 'yes',
    performance: defaultConsent.performance === 'yes',
    advertisement: defaultConsent.advertisement === 'yes',
    other: defaultConsent.other ? defaultConsent.other === 'yes' : false,
  };
}

/**
 * Get the actual Google consent based on the actual cky consent
 * @returns GoogleConsentSchema
 */
export function getActualGoogleConsent(): GoogleConsentSchema {
  const consent = getActualCkyConsent();
  return {
    ad_storage: consent.advertisement ? 'granted' : 'denied',
    ad_user_data: consent.advertisement ? 'granted' : 'denied',
    ad_personalization: consent.advertisement ? 'granted' : 'denied',
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    functionality_storage: consent.functional ? 'granted' : 'denied',
    personalization_storage: consent.functional ? 'granted' : 'denied',
    security_storage: consent.necessary ? 'granted' : 'denied',
  };
}

/**
 * Check if the given categories are all granted
 * @param categories - The categories to check
 * @returns boolean indicating if the given categories are all granted
 */
export function checkConsentGranted(categories: CookieYesConsentCategories[]): boolean {
  const consent = getActualCkyConsent();
  return categories.every((category) => consent[category as keyof CookieYesConsentStatusSchema]);
}

/**
 * Open the consent banner/modal
 * todo: check if this function is needed
 */
export function openConsentBanner(): void {
  if (typeof window === 'undefined') return;

  try {
    const cookieYes = (window as any).CookieYes;
    if (cookieYes?.open) {
      cookieYes.open();
    }
  } catch (error) {
    logger.error('Error opening consent banner:', { error });
  }
}

/**
 * Check if user has made a consent choice
 * @returns boolean indicating if consent has been set
 */
export function hasConsentBeenSet(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const cookieYes = (window as any).CookieYes;
    return cookieYes?.hasConsent?.() === true;
  } catch (error) {
    return false;
  }
}
