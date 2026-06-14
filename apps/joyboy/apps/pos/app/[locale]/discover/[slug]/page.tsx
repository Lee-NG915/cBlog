import { redirect } from 'next/navigation';

export default function DiscoverProductPage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, v));
    }
  });
  const queryString = query.toString();
  redirect(`/${params.locale}/products/${params.slug}${queryString ? `?${queryString}` : ''}`);
}
