/* eslint-disable @typescript-eslint/no-unused-vars */
// This is the RootLayout component: A wrapper for the app.
// Navigate to "app/[locale]/layout.tsx" for the main layout file.
// 📚 Reference:
//https://locize.com/blog/next-app-dir-i18n/
import * as Sentry from '@sentry/nextjs';
import { accessInAU, EcEnv } from '@castlery/config';
import { StoryblokProvider } from '@castlery/modules-cms-components';
import { GTMNoScripts, GTMTagsManager } from '@castlery/modules-tracking-components';
import { fallbackLocale, isSupportedLocale, LocalesNamespace, translationServer } from '@castlery/monorepo-i18n/server';
import { adelaila, aime, minervaModern, poppins, sanomatSans } from '@castlery/shared-next-font';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { dir } from 'i18next';
import { type Metadata } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import * as React from 'react';
import { CookieYes } from '../lib/cookieyes/cookieyes';
import { KlaviyoScript } from '../lib/klaviyo/klaviyo-script';
import { StaticAssets } from '../lib/staticAssets/staticAssets';
import { CloudinaryPreloadResources } from '../lib/cloudinary/cloudinary';
import { PublicCDNPreloadResources } from '../lib/publicCDN/publicCDN';
import { DEFAULT_IMAGE } from '@castlery/seo';
import DatadogInit from './datadog-init';

export const languageCookieHandler = (cookies: any) => {
  const storageLocale = makePersistenceHandles(cookies).preferredLanguage.getItem() ?? '';
  return isSupportedLocale(storageLocale) ? storageLocale : fallbackLocale;
};

/**
 * This component handles the layout for different locales. It dynamically loads
 * translation messages, checks for valid locales, and sets up the page
 * with appropriate fonts, themes, analytics tools, and much more.
 */
interface RegionLayoutProps {
  children: React.ReactNode;
  params: { locale: string; region: string; device: string };
}
export async function generateMetadata(): Promise<Metadata> {
  const locale = languageCookieHandler(cookies);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = await translationServer(LocalesNamespace.SHARED, { keyPrefix: 'common' });

  return {
    title: t('metadata.title'),
    description: t('metadata.description') || '',
    openGraph: {
      locale: locale,
      siteName: 'Castlery',
      type: 'website',
      images: DEFAULT_IMAGE,
    },
    twitter: {
      card: 'summary_large_image',
    },
    // Facebook App ID
    ...(EcEnv.NEXT_PUBLIC_FACEBOOK_CLIENT_ID && {
      facebook: {
        appId: EcEnv.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
      },
    }),
    other: {
      charset: 'utf-8',
      'apple-mobile-web-app-capable': 'yes',
      'mobile-web-app-capable': 'yes',
      'X-UA-Compatible': 'IE=edge,chrome=1',
      // Show the application version number
      ...(EcEnv.NEXT_PUBLIC_VERSION && {
        'application-version': EcEnv.NEXT_PUBLIC_VERSION,
      }),
      ...Sentry.getTraceData(),
    },
    verification: {
      other: {
        ...(accessInAU && {
          'trustpilot-one-time-domain-verification-id': ['pBUKKYG9iiPD8ghn5rL6qC88hTmphTNxmiZOzFDP'],
        }),
        // <meta name="p:domain_verify" content="xxxxxxxx">
        ...(t('metadata.pinterest-domain-verification') !== undefined && {
          'p:domain_verify': [t('metadata.pinterest-domain-verification') as string],
        }),
      },
    },
    manifest: '/static/favicon/manifest.json',
    icons: [
      {
        url: '/static/favicon/favicon.ico',
        sizes: 'any',
      },
    ],
  };
}

export async function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  };
}

export default function RegionLayout({ children, params: { region, device } }: RegionLayoutProps) {
  const locale = languageCookieHandler(cookies);

  return (
    <StoryblokProvider>
      {/* 了解 locale and language: https://localizely.com/blog/language-vs-locale/ */}
      <html
        lang={locale}
        dir={dir(locale)}
        style={{ scrollBehavior: 'smooth' }}
        className={`${minervaModern.variable} ${poppins.variable} ${adelaila.variable} ${aime.variable} ${sanomatSans.variable}`}
      >
        <head>
          <GTMTagsManager />
          {/* 所有 meta 标签现在通过 generateMetadata 函数生成 */}
        </head>
        <body style={{ overflowX: 'hidden' }}>
          <GTMNoScripts />
          <DatadogInit />
          <StaticAssets />
          <CloudinaryPreloadResources />
          <PublicCDNPreloadResources />
          <CookieYes />
          <KlaviyoScript />
          <NextTopLoader
            zIndex={10000}
            showSpinner={false}
            easing="ease"
            color={'#a45b37'}
            initialPosition={0.1}
            crawl={true}
          />
          {children}
        </body>
      </html>
    </StoryblokProvider>
  );
}

/**
 *
 * 🛠️ Current "component" primarily passes its children through. However, its existence
 * resolves an issue in Next.js where link clicks that change the locale might
 * otherwise be disregarded.
 *
 * 📚 Reference:
 * - Next.js Documentation: Pages and Layouts:
 *   @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
 *
 * 💡 Good to Know: `type` vs. `interface` in TypeScript
 *
 * - `type`: Preferred for simpler, local type definitions, or when union/intersection types are needed.
 * - `interface`: Ideal for declaration merging or when creating a type that will be extended.
 *
 * 📚 Reference:
 * - Understanding the difference between `type` and `interface`:
 *   @see https://levelup.gitconnected.com/typescript-what-is-the-difference-between-type-and-interface-9085b88ee531
 */
