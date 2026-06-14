import { EcEnv, CountryMapping } from '@castlery/config';
import { createMetadata } from '@castlery/seo';
import { slugToName } from '@castlery/utils';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { variationSlug: string; slug: string };
  searchParams: URLSearchParams;
}) {
  const country = EcEnv.NEXT_PUBLIC_COUNTRY?.toLocaleUpperCase();
  const countryString = EcEnv.NEXT_PUBLIC_COUNTRY === 'US' ? 'US' : CountryMapping[country] ?? '';

  const productName = slugToName(params.slug);

  return createMetadata({
    title: productName,
    description: '',
    robots: {
      index: false,
    },
  });
}
