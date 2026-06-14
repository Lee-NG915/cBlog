// https://us.posthog.com/project/109204/onboarding/product_analytics?step=install
// https://posthog.com/docs/libraries/next-js
// app/providers.js
'use client';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { EcEnv } from '@castlery/config';
import { useEffect } from 'react';
import PostHogPageView from './page-view';

const PUBLIC_POSTHOG_KEY = EcEnv.NEXT_PUBLIC_POSTHOG_KEY;
const PUBLIC_POSTHOG_HOST = EcEnv.NEXT_PUBLIC_POSTHOG_HOST;

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (PUBLIC_POSTHOG_KEY) {
      // https://posthog.com/docs/libraries/js#config
      posthog.init(PUBLIC_POSTHOG_KEY, {
        api_host: PUBLIC_POSTHOG_HOST,
        person_profiles: 'always', // or 'always' to create profiles for anonymous users as well
        enable_heatmaps: true,
        capture_pageview: false,
        capture_pageleave: true, // Enable pageleave capture
        loaded: () => {
          console.log('Posthog loaded');
        },
      });
    }
  }, []);
  return (
    <PostHogProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PostHogProvider>
  );
}
