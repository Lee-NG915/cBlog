import { expect, test } from '@playwright/test';

const storyCases = [
  { name: 'split-layout', id: 'module-checkout-webcheckoutlayout--split-layout' },
  { name: 'single-child-layout', id: 'module-checkout-webcheckoutlayout--single-child-layout' },
] as const;

const viewports = [
  { width: 1280, height: 900 },
  { width: 1366, height: 900 },
  { width: 1440, height: 900 },
  { width: 1536, height: 960 },
  { width: 1920, height: 1080 },
] as const;

for (const storyCase of storyCases) {
  for (const viewport of viewports) {
    test(`${storyCase.name} renders without horizontal overflow at ${viewport.width}x${viewport.height}`, async ({
      page,
      baseURL,
    }, testInfo) => {
      test.skip(!baseURL, 'baseURL is required for Storybook visual checks');

      await page.setViewportSize(viewport);
      await page.goto(`${baseURL}/iframe.html?id=${storyCase.id}&viewMode=story`, { waitUntil: 'networkidle' });
      await expect(page.locator('#storybook-root')).toBeVisible();

      const diagnostics = await page.evaluate(() => {
        const root = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(root.scrollWidth, body.scrollWidth);
        const scrollHeight = Math.max(root.scrollHeight, body.scrollHeight);

        return {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          scrollWidth,
          scrollHeight,
          hasHorizontalOverflow: scrollWidth > window.innerWidth,
        };
      });

      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach(`${storyCase.name}-${viewport.width}x${viewport.height}`, {
        body: screenshot,
        contentType: 'image/png',
      });

      expect(diagnostics.hasHorizontalOverflow).toBe(false);
      expect(diagnostics.scrollWidth).toBe(diagnostics.innerWidth);
    });
  }
}
