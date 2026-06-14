// Necessary if using App Router to ensure this file runs on the client
'use client';

import { datadogRum } from '@datadog/browser-rum';
import { EcEnv } from '@castlery/config';

if (!EcEnv.NEXT_PUBLIC_DATADOG_APP_ID || !EcEnv.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
  console.error('Datadog RUM not initialized: Missing environment variables');
} else {
  datadogRum.init({
    applicationId: EcEnv.NEXT_PUBLIC_DATADOG_APP_ID,
    clientToken: EcEnv.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    // `site` refers to the Datadog site parameter of your organization
    // see https://docs.datadoghq.com/getting_started/site/
    site: 'datadoghq.com',
    service: 'joyboy-pos',
    env: EcEnv.NEXT_PUBLIC_APPLICATION_ENV,
    // Specify a version number to identify the deployed version of your application in Datadog
    version: process.env.NEXT_PUBLIC_VERSION,
    traceSampleRate: 50,
    sessionSampleRate: 50,
    // sessionReplaySampleRate: 0,
    trackUserInteractions: true,
    trackResources: false,
    trackLongTasks: true,
    // defaultPrivacyLevel: 'mask-user-input',
    // regExp: pos(-test|-uat).castlery.com, pos(-test|-uat).castlery.co
    allowedTracingUrls: [/https:\/\/pos(?:-test|-uat)?\.castlery\.(com|co)/],
  });
}

export default function DatadogInit() {
  // Render nothing - this component is only included so that the init code
  // above will run client-side
  return null;
}
