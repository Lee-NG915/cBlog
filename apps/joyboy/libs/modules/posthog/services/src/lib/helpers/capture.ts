import { accessInServer, EcEnv } from '@castlery/config';
import PostHogClient from './posthog-client';
import posthog from 'posthog-js';

export const enablePosthogManualCapture = EcEnv.NEXT_PUBLIC_COUNTRY === 'AU';

export function phCapture(event: string, properties: Record<string, any>) {
  if (!enablePosthogManualCapture) return;
  const posthogClient = accessInServer ? PostHogClient() : posthog;
  posthogClient.capture(event, properties);
}

/**
 * posthog标准事件 
 * posthog.identify(
    'distinct_id',  // Replace 'distinct_id' with your user's unique identifier
    { email: '7ad95ddda3d4ca9d4489764afc51d3a', name: 'Max Hedgehog' } // optional: set additional person properties
    );
 * @param hashedEmail hashed email to identify the user
 */
export function phIdentify(hashedEmail: string) {
  phCapture('custom_identify', {
    customer_email: hashedEmail,
    customer_region: EcEnv.NEXT_PUBLIC_COUNTRY,
  });
}
