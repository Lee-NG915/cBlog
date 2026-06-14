import dynamic from 'next/dynamic';

const ProductDyRecommendationsClient = dynamic(
  () => import('./product-dy-recommendations.client').then((mod) => mod.ProductDyRecommendationsClient),
  {
    ssr: false,
  }
);

export const ProductDyRecommendationsServer = async () => {
  return <ProductDyRecommendationsClient />;
};
