/**
 * This module provides utilities for managing navigation and
 * locale information in Next.js application using next-intl.
 *
 * @see https://next-intl-docs.vercel.app/docs/routing/navigation
 * @see https://github.com/meienberger/runtipi/blob/develop/src/shared/internationalization/locales.ts
 */

import { EcEnv } from './ec-env';

// import {
//   createLocalizedPathnamesNavigation,
//   createSharedPathnamesNavigation,
//   type Pathnames,
// } from 'next-intl/navigation';

// todo: finish the new version of this file:
// todo: src/islands/switchers/navigation-new-beta.tsx

// Default locale for the application.
// export const defaultLocale = "en-us";
export const defaultLocale = EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase();

// Supported locales.
export const locales = [
  {
    value: 'sg',
    label: 'Singapore',
  },
  {
    value: 'us',
    label: 'United States',
  },
  {
    value: 'au',
    label: 'Australia',
  },
  {
    value: 'uk',
    label: 'United Kingdom',
  },
  {
    value: 'ca',
    label: 'Canada',
  },
].filter(({ value }) => {
  return EcEnv.NEXT_PUBLIC_ACCESS_COUNTRY.includes(
    value.toUpperCase() as (typeof EcEnv.NEXT_PUBLIC_ACCESS_COUNTRY)[number]
  );
});

export const posRoutes = {
  login: `/${defaultLocale}/login`,
  products: `/${defaultLocale}/products`,
  checkout: `/${defaultLocale}/checkout`,
  saleHistory: `/${defaultLocale}/sale-history`,
} as const;

// Labels for each supported locale, used for displaying human-readable names.
// export const labels = {
//   'de-de': 'German',
//   'en-us': 'English',
//   'es-es': 'Spanish',
//   'fa-ir': 'Persian',
//   'fr-fr': 'French',
//   'hi-in': 'Hindi',
//   'it-it': 'Italian',
//   'pl-pl': 'Polish',
//   'tr-tr': 'Turkish',
//   'uk-ua': 'Ukrainian',
//   'zh-cn': 'Chinese',
// } as const;

// // Type representing valid locale strings.
// export type Locale = (typeof locales)[number];

// // Ensure every locale has a label.
// if (process.env.NODE_ENV === 'development') {
//   // biome-ignore lint/complexity/noForEach: <explanation>
//   locales.forEach((locale) => {
//     if (!labels[locale]) {
//       console.warn(`No label found for locale: ${locale}`);
//     }
//   });
// }

// Navigation utilities configured for the defined locales.
// export const { Link, redirect, usePathname, useRouter } =
//   createSharedPathnamesNavigation({ locales });

// === NEXT-INTERNATIONAL ===

/* export const localesNI = {
  "en-us": () => import("~/data/i18n/en-us.json"),
  "uk-ua": () => import("~/data/i18n/uk-ua.json"),
} as const;

type LocalesKeys = keyof typeof locales;

export const localeListNI = Object.keys(locales) as LocalesKeys[];

const allLocales = {
  "en-us": "en-us",
  "uk-ua": "uk-ua",
} as const;

export const LOCALES_NI: typeof allLocales = allLocales;

export const defaultLocaleNI = "en-us" as const satisfies keyof typeof localesNI; */
