import { defineConfig } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';

import { workspaceRoot } from '@nx/devkit';

const storybookPort = 6010;
const baseURL = `http://127.0.0.1:${storybookPort}`;
const storybookOutputDir = '/tmp/web-e2e-storybook-checkout';
const storybookEnv =
  'NEXT_PUBLIC_API_HOST=http://localhost ' +
  'NEXT_PUBLIC_COUNTRY=US ' +
  'NEXT_PUBLIC_LOCALE=en-US ' +
  'NEXT_PUBLIC_APPLICATION_ENV=us-test ' +
  'NEXT_PUBLIC_GTM_ID=GTM-TEST ' +
  'NEXT_PUBLIC_CHANNEL=WEB ' +
  'NEXT_PUBLIC_WEB_SERVER_NAME=http://localhost ' +
  'NEXT_PUBLIC_BASE_URL=http://localhost ' +
  'NEXT_PUBLIC_ACCESS_COUNTRY=US ' +
  'NODE_ENV=production HOME=/tmp/storybook-home CI=1 STORYBOOK_DISABLE_TELEMETRY=1';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src/checkout-layout' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  workers: 1,
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'dist/.playwright/web-e2e/checkout-layout-report', open: 'never' }]],
  webServer: {
    command:
      `${storybookEnv} pnpm exec storybook build -c apps/web-e2e/.storybook-checkout -o ${storybookOutputDir} ` +
      `&& python3 -m http.server ${storybookPort} --directory ${storybookOutputDir}`,
    url: baseURL,
    reuseExistingServer: false,
    cwd: workspaceRoot,
    timeout: 240000,
  },
  projects: [
    {
      name: 'chromium',
    },
  ],
});
