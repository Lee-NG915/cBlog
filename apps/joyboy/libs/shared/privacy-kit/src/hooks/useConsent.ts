'use client';

import { useEffect, useState } from 'react';
import { CookieYesConsentCategories, CookieYesConsentStatusSchema } from '../types';
import { getActualCkyConsent, checkConsentGranted } from '../utils';

/**
 * Hook to check consent for a specific category
 * @param category - The cookie category to check
 * @returns boolean indicating if consent is granted
 */
export function useConsent(category: CookieYesConsentCategories): boolean {
  const [consent, setConsent] = useState(() => checkConsentGranted([category]));

  useEffect(() => {
    // Update initial state
    setConsent(checkConsentGranted([category]));

    // Listen for consent updates
    const handleConsentUpdate = () => {
      setConsent(checkConsentGranted([category]));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cookieyes_consent_update', handleConsentUpdate);

      return () => {
        window.removeEventListener('cookieyes_consent_update', handleConsentUpdate);
      };
    }

    return undefined;
  }, [category]);

  return consent;
}

/**
 * Hook to get all consent statuses
 * @returns CookieYesConsentStatusSchema object with all categories
 */
export function useAllConsents(): CookieYesConsentStatusSchema {
  const [consents, setConsents] = useState<CookieYesConsentStatusSchema>(() => getActualCkyConsent());

  useEffect(() => {
    // Update initial state
    setConsents(getActualCkyConsent());

    // Listen for consent updates
    const handleConsentUpdate = () => {
      setConsents(getActualCkyConsent());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cookieyes_consent_update', handleConsentUpdate);

      return () => {
        window.removeEventListener('cookieyes_consent_update', handleConsentUpdate);
      };
    }

    return undefined;
  }, []);

  return consents;
}
