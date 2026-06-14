import {
    GoogleConsentSchema,
    CookieYesConsentSchema,
    CookieYesConsentStatusSchema,
    CookieYesConsentStatus,
    CookieYesLoadEventDetail,
    CookieYesConsentCategories,
} from './type';
import { get } from 'helpers/Cookie';

/**
 * Cookie name for CookieYes consent
 */
const CKY_CONSENT_COOKIE_NAME = 'cookieyes-consent';

/**
 * Default granted consent config for CookieYes
 * always default granted in AU,SG,US
 */
export const DEFAULT_GRANTED_CKY_CONSENT_CONFIG: CookieYesConsentSchema = {
    necessary: 'yes',
    functional: 'yes',
    analytics: 'yes',
    performance: 'yes',
    advertisement: 'yes',
    other: 'yes',
};

/**
 * Default denied consent config for CookieYes
 * always default denied in CA,UK, because of GDPR, etc.
 */
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
export const DEFAULT_DENIED_REGIONS: string[] = ['CA', 'UK'];

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
 * @param consentCookie - The cookie value string
 * @returns The parsed consent object or null if the cookie is empty
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
    const consentCookie = get(CKY_CONSENT_COOKIE_NAME) || '';
    if (!consentCookie) return null;
    return parseConsentFromCookie(consentCookie);
};

export const ckySchemaToStatusSchema = (consent: CookieYesConsentSchema): CookieYesConsentStatusSchema => ({
    necessary: consent.necessary === 'yes',
    functional: consent.functional === 'yes',
    analytics: consent.analytics === 'yes',
    performance: consent.performance === 'yes',
    advertisement: consent.advertisement === 'yes',
    other: !!consent.other && consent.other === 'yes',
});

/**
 * Get all consent statuses
 * Tries to use getCkyConsent from window first, falls back to cookie parsing
 * @returns ConsentStatus object with all categories
 */
export function getAllCKYConsentsStatuses(): CookieYesConsentStatusSchema {
    if (typeof window !== 'undefined') {
        // Try to use getCkyConsent if available
        const getCkyConsent = window.getCkyConsent;
        if (typeof getCkyConsent === 'function') {
            try {
                const consent = window.getCkyConsent() as CookieYesLoadEventDetail;
                const categories = consent.categories;
                if (categories && Object.keys(categories).length > 0) {
                    return categories;
                }
            } catch (error) {
                console.error('Error getting consent via getCkyConsent:', error);
            }
        }
    }

    // Fall back to cookie parsing
    if (typeof window !== 'undefined') {
        const consentValues = getCKYConsentCookieValues();
        if (consentValues && Object.keys(consentValues).length > 0) {
            return ckySchemaToStatusSchema(consentValues);
        }
    }

    // Default: use default consent config based on region
    const defaultConsent = isDefaultDeniedRegion(__COUNTRY__)
        ? DEFAULT_DENIED_CKY_CONSENT_CONFIG
        : DEFAULT_GRANTED_CKY_CONSENT_CONFIG;
    return ckySchemaToStatusSchema(defaultConsent);
}

/**
 * Check if the given categories are all granted
 * @param categories - The categories to check
 * @returns boolean indicating if the given categories are all granted
 */
export function checkConsentGranted(categories: CookieYesConsentCategories[]): boolean {
    const consent = getAllCKYConsentsStatuses();
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
        console.error('Error opening consent banner:', error);
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
