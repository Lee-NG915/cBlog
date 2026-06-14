import { getReviewsByVariantServer } from '@castlery/modules-product-domain';

export const getPlaReviews = async (variantCode: string) => {
  const reviews = await getReviewsByVariantServer({
    variantCode,
    orderBy: 'recommended',
  });
  let finalReviews = [];
  finalReviews = reviews.filter((item) => item.attachments?.length > 0).slice(0, 5);
  if (finalReviews.length < 5) {
    finalReviews = reviews.filter((item) => item.attachments?.length <= 0).slice(0, 5);
  }
  if (finalReviews.length < 5) {
    finalReviews = [];
  }
  return finalReviews?.sort((a, b) => b.rating - a.rating);
};
