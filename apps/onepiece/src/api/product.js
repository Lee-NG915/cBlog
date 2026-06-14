import { client } from 'helpers/ApiClient';

export const getPriceByVariantId = (variantId, query = '') => {
  const url = `/v3/variants/${variantId}/price${query}`;
  return client.get(url, {
    // auth: 'loose',
  });
};
export const getRetailsById = (id = '') => {
  const url = `retails/${id}`;
  return client.get(url, {
    // auth: 'loose',
  });
};

export const postEstimatesLeadtime = (params) => {
  const url = `/v2/estimates/leadtime`;
  return client.post(url, {
    auth: 'loose',
    data: params,
  });
};

/**
 * @typedef {Object} shippingConfigurations
 * @property {String} zip
 * @property {String} inventory_region_code
 * @property {String} city
 * @property {String} state_abbr
 */

export const getShippingConfigurations = (targetZipcode) => {
  const url = `/shipping_configurations/${targetZipcode}`;
  return client.get(url, {
    auth: 'loose',
  });
};

export const getVariantById = (variantId = '') => {
  const url = `/v3/variants/${variantId}`;
  return client.get(url, {
    // auth: 'loose',
  });
};

/**
 *
 * @param {string} params.email
 * @returns
 */
export const postSubscriptions = (params) => {
  const url = `/subscriptions`;
  return client.post(url, {
    // auth: 'loose',
    data: params,
  });
};

/**
 *
 * @param {*} variantIds variantIds is array of variantId
 * @returns {Promise}
 */
export const getVariantByIds = (variantIds) => {
  const url = `/variants`;
  return client.get(url, {
    params: {
      ids: variantIds.toString(),
    },
  });
};

export const getVariantCollectionList = (params) => {
  const url = `/variants/by_swatch/${params?.collectionId}`;
  return client.get(url, {
    params: {
      page: params.index,
      per_page: params.numPerPage,
    },
  });
};
