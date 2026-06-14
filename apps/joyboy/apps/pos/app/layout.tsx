// This is the RootLayout component: A wrapper for the app.
// Navigate to "app/[locale]/layout.tsx" for the main layout file.
import type { Viewport } from 'next';
// import DatadogInit from './datadog-init';

/**
 * @doc https://nextjs.org/docs/app/api-reference/functions/generate-viewport#width-initialscale-maximumscale-and-userscalable
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {/* Layout UI */}
        {/* <DatadogInit /> */}
        {children}
      </body>
    </html>
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
