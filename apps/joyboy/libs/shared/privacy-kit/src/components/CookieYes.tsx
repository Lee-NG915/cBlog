'use client';
import Script from 'next/script';
import { useEffect } from 'react';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/client';
import * as Sentry from '@sentry/nextjs';
import {
  CookieYesLoadEvent,
  CookieYesLoadEventDetail,
  CookieYesUpdateEvent,
  CookieYesUpdateEventDetail,
} from '../types';

const DEFAULT_SCRIPT_ID = 'cookieyes';

interface CookieYesProps {
  onBannerLoad?: (eventData: CookieYesLoadEventDetail) => void;
  onConsentUpdate?: (consent: CookieYesUpdateEventDetail) => void;
}
/**
 * CookieYes loader using next/script for better Next.js integration.
 * Set the code right after the opening <head> tag in your site's source code.
 */
export function CookieYes({ onConsentUpdate, onBannerLoad }: CookieYesProps) {
  const isEnabled = EcEnv.NEXT_PUBLIC_COOKIEYES_ENABLED;
  const src = EcEnv.NEXT_PUBLIC_COOKIEYES_CDN;

  // Listen for banner load events
  // @see https://www.cookieyes.com/documentation/events-on-cookie-banner-load/
  useEffect(() => {
    if (!isEnabled || !src) return;

    const handleBannerLoad = (eventData: Event) => {
      const detail = (eventData as CookieYesLoadEvent).detail;
      if (onBannerLoad) {
        onBannerLoad(detail);
      }
      //   logger.info('cookieyes_banner_load', { eventData });
      // TODO: optimize point @abby23 set default consent by law, not by hard-code regional default consent
      //   if (data.activeLaw === 'gdpr') {
      //     // perform the desired action.
      //   }
    };

    document.addEventListener('cookieyes_banner_load', handleBannerLoad);
    return () => {
      document.removeEventListener('cookieyes_banner_load', handleBannerLoad);
    };
  }, [isEnabled, src, onBannerLoad]);

  // Listen for consent updates emitted by CookieYes
  // @see https://www.cookieyes.com/documentation/events-on-cookie-banner-interactions/
  useEffect(() => {
    if (!isEnabled || !src) return;

    const handleConsentUpdate = (event: Event) => {
      const data = (event as CookieYesUpdateEvent).detail;
      if (data && onConsentUpdate) {
        onConsentUpdate(data);
      }
    };

    document.addEventListener('cookieyes_consent_update', handleConsentUpdate);
    return () => {
      document.removeEventListener('cookieyes_consent_update', handleConsentUpdate);
    };
  }, [isEnabled, src, onConsentUpdate]);

  // Skip rendering when not configured
  if (!isEnabled || !src) {
    logger.info('cookieyes_skipped', { reason: !isEnabled ? 'disabled' : 'missing_src' });
    return null;
  }

  return (
    <Script
      id={DEFAULT_SCRIPT_ID}
      type="text/javascript"
      src={src}
      strategy="afterInteractive"
      onLoad={() => logger.info('cookieyes_script_loaded', { src })}
      onError={(error) => {
        logger.error('cookieyes_script_error', { src, error });
        Sentry.captureException(error, {
          tags: {
            domain: 'cookieyes',
            step: 'cookieyes_init_script_error',
          },
        });
      }}
    />
  );
}
