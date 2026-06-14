import dynamic from 'next/dynamic';
const ProductSocialUgcClient = dynamic(
  () => import('./product-social-ugc.client').then((mod) => mod.ProductSocialUgcClient),
  {
    ssr: false,
  }
);

interface ProductSocialUgcProps {
  pageType: 'pdp' | 'pla';
}

export async function ProductSocialUgc({ pageType }: ProductSocialUgcProps) {
  return <ProductSocialUgcClient pageType={pageType} />;
}
