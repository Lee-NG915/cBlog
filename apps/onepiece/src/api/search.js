import { client } from 'helpers/ApiClient';

export const postProductSearch = (params) => {
  const url = `/product/_search`;
  return client.post(url, {
    data: params,
  });
};
export const getProductAutocomplete = (params) => {
  const url = `/product/autocomplete`;

  return client.get(url, {
    // auth: 'loose',
    // data: params,
    params,
  });
};
export const getAddresses = (params) => {
  const url = `/addresses`;
  return client.get(url, {
    // auth: 'loose',
    // data: params,
    params,
  });
};
export const getCites = (params) => {
  const url = `/cities`;
  return client.get(url, {
    // auth: 'loose',
    // data: params,
    params,
  });
};
