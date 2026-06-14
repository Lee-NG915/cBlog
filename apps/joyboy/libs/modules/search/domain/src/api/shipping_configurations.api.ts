import { api } from '@castlery/shared-redux-services';

import type { ShippingConfiguration } from '../entity/shipping.entity';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/client';

export const shippingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getShippingConfiguration: builder.query<ShippingConfiguration, string>({
      query: (zipcode) => ({
        url: `shipping_configurations/${zipcode}`,
        method: 'GET',
      }),
    }),
  }),
});
export const { useGetShippingConfigurationQuery } = shippingApi;
export const { getShippingConfiguration } = shippingApi.endpoints;

export const getInventoryRegionCodeByZipcode = async (zipcode: string) => {
  let res;
  try {
    const response = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/shipping_configurations/${zipcode}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 3600,
      },
    });
    const data = await response.json();
    const { inventory_region_code } = data;
    if (inventory_region_code) {
      res = inventory_region_code;
    }
  } catch (error) {
    logger.error('getInventoryRegionCodeByZipcode', { zipcode, error });
  }
  return res;
};
