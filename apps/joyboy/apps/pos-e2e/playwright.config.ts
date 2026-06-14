import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';
import { join } from 'path';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:6061';

/**c
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

const appDir = join(workspaceRoot, 'apps/pos-e2e/src');

/**
 * https://vitalets.github.io/playwright-bdd/#/configuration
 *
 * Configuration is passed to defineBddConfig() inside Playwright config file.
 * Some options are identical to CucumberJS options and some are special for playwright-bdd.
 */
const testDir = defineBddConfig({
  importTestFrom: join(appDir, '/steps/fixtures.ts'),
  paths: [join(appDir, '/features/')],
  quotes: 'backtick',
  featuresRoot: join(appDir, '/features/'),
  require: [join(appDir, '/steps/*.ts')],
});

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir,
  ...nxE2EPreset(__filename, { testDir }),
  // outputDir: 'test-results/',
  reporter: [cucumberReporter('html', { outputFile: join(workspaceRoot, 'apps/pos-e2e/reports/report.html') })],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npx nx run pos:serve --configuration=development ',
    // reuseExistingServer: !process.env.CI,
    cwd: workspaceRoot,
    port: 6061,
    reuseExistingServer: true,
  },
  projects: [
    // {
    //   name: 'chromium',
    //   use: { ...devices['iPad Pro 11'] },
    // },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    {
      name: 'webkit',
      use: { ...devices['iPad Pro 11 landscape'] },
    },

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
