import dynamic from 'next/dynamic';

const ProductRecommendationsClient = dynamic(
  () => import('./product-recommendations.client').then((mod) => mod.ProductRecommendationsClient),
  {
    ssr: false,
  }
);

export const ProductRecommendationsServer = async () => {
  return <ProductRecommendationsClient />;
};
