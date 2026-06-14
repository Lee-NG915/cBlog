// Necessary if using App Router to ensure this file runs on the client
'use client';

import { datadogRum } from '@datadog/browser-rum';
import { EcEnv } from '@castlery/config';
import { useEffect } from 'react';

function getBaseRumContext() {
  return {
    channel: EcEnv.NEXT_PUBLIC_CHANNEL?.toLowerCase(),
    country: EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase(),
    locale: EcEnv.NEXT_PUBLIC_LOCALE,
    env: EcEnv.NEXT_PUBLIC_APPLICATION_ENV,
    service: 'joyboy-web',
    version: process.env.NEXT_PUBLIC_VERSION,
  };
}

if (!EcEnv.NEXT_PUBLIC_DATADOG_APP_ID || !EcEnv.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
  console.error('Datadog RUM not initialized: Missing environment variables');
} else {
  datadogRum.init({
    applicationId: EcEnv.NEXT_PUBLIC_DATADOG_APP_ID,
    clientToken: EcEnv.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    // `site` refers to the Datadog site parameter of your organization
    // see https://docs.datadoghq.com/getting_started/site/
    site: 'datadoghq.com',
    service: 'joyboy-web',
    env: EcEnv.NEXT_PUBLIC_APPLICATION_ENV,
    // Specify a version number to identify the deployed version of your application in Datadog
    version: process.env.NEXT_PUBLIC_VERSION,
    traceSampleRate: 100,
    sessionSampleRate: 50,
    // sessionReplaySampleRate: 0,
    trackUserInteractions: true,
    trackResources: false,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    // defaultPrivacyLevel: 'mask-user-input',
    // regExp: web(-test|-uat).castlery.com, web(-test|-uat).castlery.co
    allowedTracingUrls: [/https:\/\/web(?:-test|-uat)?\.castlery\.(com|co)/],
  });

  datadogRum.setGlobalContext(getBaseRumContext());
}

export default function DatadogInit() {
  useEffect(() => {
    datadogRum.setGlobalContext(getBaseRumContext());
  }, []);

  // Render nothing - this component is only included so that the init code
  // above will run client-side
  return null;
}
