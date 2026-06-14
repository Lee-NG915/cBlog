import { GlobalReviewSummary, Product, Variant } from '@castlery/modules-product-domain';

export const generateKeyWords = (product: Product, variant: Variant) => {
  const keywordsArr = [];

  // 产品名称和选项
  const optionWords = variant?.variant_option_values?.map((v: any) => v.presentation).join(', ') || '';
  keywordsArr.push(`${product.name}${optionWords ? `, ${optionWords}` : ''}`);

  // 分类
  const categoryWords = product.taxons
    ?.filter((t: any) => t.level !== 0)
    .map((t: any) => t.name)
    .join(', ');

  if (categoryWords) {
    keywordsArr.push(categoryWords);
  }

  return keywordsArr.filter((w) => w !== '').join(', ');
};

/**
 * 生成评分对象（新版本，返回对象）
 * 用于安全地构建 JSON-LD Schema，避免字符串拼接导致的格式错误
 */
export const generateRatingObject = (product: Product) => {
  const reviews = product.reviews;
  if ('total_count' in reviews && 'average_rating' in reviews) {
    if (reviews.total_count < 1 || reviews.average_rating < 3) {
      return null;
    }

    return {
      '@type': 'AggregateRating',
      ratingValue: reviews.average_rating,
      reviewCount: reviews.total_count,
      worstRating: '1',
      bestRating: '5',
    };
  }
  return null;
};

/**
 * 生成评论数组（新版本，返回数组）
 * 用于安全地构建 JSON-LD Schema，避免字符串拼接导致的格式错误
 */
export const generateReviewsArray = (product: Product) => {
  const reviews = product.reviews;
  if ('average_rating' in reviews && 'reviews' in reviews) {
    const productReviews = reviews?.reviews;
    if (!productReviews || productReviews?.length === 0 || reviews?.average_rating < 3) {
      return null;
    }

    return productReviews
      .filter((review) => review.rating != null)
      .map((review) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review?.user_name?.trim() || 'Castlery Customer',
        },
        datePublished: review.updated_at || new Date().toISOString(),
        reviewBody: review.content || '',
        reviewRating: {
          '@type': 'Rating',
          bestRating: '5',
          ratingValue: String(review.rating),
          worstRating: '1',
        },
      }));
  }
  return null;
};

/**
 * @deprecated 使用 generateRatingObject 代替
 * 生成评分字符串（旧版本，保留向后兼容）
 */
export const generateRatingString = (product: Product) => {
  const rating = generateRatingObject(product);
  if (rating) {
    return `"aggregateRating": ${JSON.stringify(rating)},`;
  }
  return '';
};

/**
 * @deprecated 使用 generateReviewsArray 代替
 * 生成评论字符串（旧版本，保留向后兼容）
 */
export const generateThreeReviews = (product: Product) => {
  const reviews = generateReviewsArray(product);
  if (reviews) {
    return `"review": ${JSON.stringify(reviews)},`;
  }
  return '';
};
