import { EcEnv } from '@castlery/config';

export const getStaticPrefixes = () => {
  // Return a list of possible value for locale
  // const locales = languages;
  // const regions = supportRegions;
  const regions = EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase();

  //Get the paths we want to pre-render based on posts
  // const prefixes = locales.reduce((acc: any, locale: string) => {
  //   regions.forEach((region) => {
  //     acc.push({ locale, region });
  //   });
  //   return acc;
  // }, []);
  const prefixes = [{ region: regions, locale: 'en', deviceTheme: 'mobile' }];
  return prefixes;
};

// Next.js will invalidate the cache when a new request comes in
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
// The revalidate value is not available when using runtime = 'edge'.
export const revalidate = 600;

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams
export const dynamicParams = true; // or false, to 404 on unknown paths
// set search params null
export const dynamic = 'force-static';

/**
 * ISR in Next:
 * https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
 */
export async function generateStaticParams() {
  // Return a list of possible value for locale
  const prefixes = getStaticPrefixes();

  const productSlugs = ['how-to-pick-a-sofa-colour'];
  const arr = prefixes.reduce((acc: any, path: any) => {
    productSlugs.forEach((slug) => {
      acc.push({
        ...path,
        slug,
      });
    });
    return acc;
  }, []);
  //   console.log('🚀 ~ generateStaticParams ~ finalArr', finalArr);
  return arr;
}
