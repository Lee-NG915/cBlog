import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('the sales representative on the PDP', async ({ page }) => {
  // 添加cookie
  await page.context().addCookies([
    {
      name: 'retail_id',
      value: '5',
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
    },
    {
      name: 'country',
      value: 'sg',
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
    },
    {
      name: 'is_logged_in',
      value: '1',
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
    },
    {
      name: 'access_token',
      value: 'hZFjFPm9x3whA4AkJgHhIvy0_sO1fy-pjavDA5cjikk',
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
    },
    {
      name: 'refresh_token',
      value: 'xV4hDkJnQa2Vh7MDqt6np_jsCn72s9CIUomyUUNADz4',
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
    },
  ]);

  // 导航到目标页面
  await page.goto('http://localhost:6061/sg/products');
  await page.waitForURL(/http:\/\/localhost:6061\/sg\/products\/R*/);

  await page.getByRole('combobox', { name: 'Search products' }).click();
  await page.getByRole('combobox', { name: 'Search products' }).fill('sofa');
  await page.getByRole('option', { name: 'Jonathan Sofa Jonathan Sofa' }).click();

  await page.waitForLoadState('load');
});

Given('the sales representative change-variant on the PDP', async ({ page }) => {
  await page.getByLabel('Dark Granite').check();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
When('the system triggers {string}', async ({ page }, arg: string) => {
  // ...
});

Then('display the Estimated Delivery information and ensure the Add to Cart button is clickable', async ({ page }) => {
  // ...

  await expect(page.getByText(/Out of Stock/i)).toBeHidden();
  await expect(page.getByRole('button', { name: 'Add To Cart' })).toBeVisible();
});

Given('the sales representative change-stock-location on the PDP', async ({ page }) => {
  // ...

  await page.getByRole('main').getByText('Warehouse').click();
  await page.getByRole('option', { name: 'LiatTowers Display' }).click();
});

Given('the sales representative change-variant-quantity on the PDP', async ({ page }) => {
  // ...

  await page.getByRole('textbox').click();
  await page.getByRole('textbox').press('Meta+a');
  await page.getByRole('textbox').fill('999');
  await page.locator('.MuiCard-root > div > div:nth-child(2)').click();
});

Then('display the Out of Stock information and ensure the Add to Cart button is disabled', async ({ page }) => {
  // ...

  await expect(page.getByText('leadtime OUT_OF_STOCK')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Out of Stock$/ })).toBeVisible();
});
