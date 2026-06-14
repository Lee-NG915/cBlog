export type CookieYesConsentCategories =
    | 'necessary'
    | 'analytics'
    | 'advertisement'
    | 'functional'
    | 'performance'
    | 'other';

export type CookieYesConsentStatus = 'yes' | 'no';

export type CookieYesConsentSchema = {
    necessary: CookieYesConsentStatus;
    functional: CookieYesConsentStatus;
    analytics: CookieYesConsentStatus;
    performance: CookieYesConsentStatus;
    advertisement: CookieYesConsentStatus;
    other?: CookieYesConsentStatus;
};

export type CookieYesConsentStatusSchema = {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    performance: boolean;
    advertisement: boolean;
    other?: boolean;
};

export type GoogleConsentStatus = 'granted' | 'denied';

export type GoogleConsentSchema = {
    ad_personalization: GoogleConsentStatus;
    ad_storage: GoogleConsentStatus;
    ad_user_data: GoogleConsentStatus;
    analytics_storage: GoogleConsentStatus;
    functionality_storage: GoogleConsentStatus;
    personalization_storage: GoogleConsentStatus;
    security_storage: GoogleConsentStatus;
};

export interface CookieYesLoadEvent extends Event {
    detail: {
        activeLaw: string; // e.g., "gdpr", "ccpa", etc.
        categories: CookieYesConsentStatusSchema;
        isUserActionCompleted: boolean;
        consentID: string;
        languageCode: string; // such as "en", "zh", etc.
    };
}

export type CookieYesLoadEventDetail = CookieYesLoadEvent['detail'];

export interface CookieYesUpdateEvent extends Event {
    detail: {
        accepted: CookieYesConsentCategories[];
        rejected: CookieYesConsentCategories[];
    };
}

export type CookieYesUpdateEventDetail = CookieYesUpdateEvent['detail'];


declare global {
    interface Window {
        getCkyConsent: () => CookieYesLoadEventDetail;
    }
}