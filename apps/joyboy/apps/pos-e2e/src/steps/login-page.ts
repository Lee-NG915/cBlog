/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty-pattern */
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';
const { Given, When, Then } = createBdd(test);

Given('Sales Representative is on the login page of a market', async ({ page }) => {
  // ...
  await page.goto('http://localhost:6061/sg/login');
});

// 2. Missing step definition for "src/features/login-page.feature:9:5"
Given('the sales representative has chosen a branch', async ({ page }) => {
  await page.getByRole('combobox', { name: /Retail Store/i }).click();
  await page.getByRole('option', { name: /Orchard Flagship/i }).click();
});

// 3. Missing step definition for "src/features/login-page.feature:12:5"
When('they enter a valid email and password', async ({ page }) => {
  await page.getByRole('textbox', { name: /Email/i }).fill('rick.gao@castlery.com');
  await page.getByRole('textbox', { name: /Password/i }).fill('Rick0.321abc');
  // ...
});

// 4. Missing step definition for "src/features/login-page.feature:13:5"
Then('they should be logged in and directed to the POS Discovery Page', async ({ page }) => {
  // ...
  //
  await page.waitForURL(/http:\/\/localhost:6061\/sg\/products\/R.*/);
});

// 1. Missing step definition for "src/features/login-page.feature:11:5"
When('they enter valid@email.com and password', async ({ page }) => {
  // ...

  await page.getByLabel('Email *').click();
  await page.getByLabel('Email *').fill('rick.gao@castlery.com');
  await page.getByLabel('Password *').click();
  await page.getByLabel('Password *').fill('Rick0.321abc');
});

// 2. Missing step definition for "src/features/login-page.feature:12:5"
Then('they should see {string} in real time', async ({}, arg: string) => {
  // ...
});

// 3. Missing step definition for "src/features/login-page.feature:13:5"
Then('they should not be able to click on the login button', async ({ page }) => {
  // ...
});

// 4. Missing step definition for "src/features/login-page.feature:11:5"
When('they enter invalidemail and password', async ({}) => {
  // ...
});

// 5. Missing step definition for "src/features/login-page.feature:11:5"
When('they enter valid@email.com and short', async ({}) => {
  // ...
});

// 6. Missing step definition for "src/features/login-page.feature:11:5"
When('they enter valid@email.com and ', async ({}) => {
  // ...
});

// 7. Missing step definition for "src/features/login-page.feature:11:5"
When('they enter  and password', async ({}) => {
  // ...
});

// 8. Missing step definition for "src/features/login-page.feature:11:5"
When('they enter invalidemail and invalid', async ({}) => {
  // ...
});

// 9. Missing step definition for "src/features/login-page.feature:26:5"
When('they submit', async ({ page }) => {
  // ...

  await page.getByRole('button', { name: 'Submit' }).click();
});

// 10. Missing step definition for "src/features/login-page.feature:30:5"
Given('they enter an email or password that pass format validation', async ({}) => {
  // ...
});

// 12. Missing step definition for "src/features/login-page.feature:32:5"
Then('they should see an error popup and remain on the login page', async ({}) => {
  // ...
});

// 13. Missing step definition for "src/features/login-page.feature:35:5"
When('they click the {string} button', async ({}, arg: string) => {
  // ...
});

// 14. Missing step definition for "src/features/login-page.feature:36:5"
Then('they should be taken back to the market selection page', async ({}) => {
  // ...
});
