import { client } from 'helpers/ApiClient';

/**
 * @property {string} variantCode
 */
export const getCartItemReview = ({ variantCode }) => {
  const url = `/gw/reviews/summary`;
  return client
    .get(url, {
      params: {
        variant_code: variantCode,
      },
    })
    .catch((err) => {
      console.error(JSON.stringify({ message: 'getCartItemReview error', error: err }, null, 2));
    });
};
