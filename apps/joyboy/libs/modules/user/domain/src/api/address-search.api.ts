import { api } from '@castlery/shared-redux-services';
import type { GoogleAddressEntity_V2 } from '@castlery/types';
import type { SGSearchedPlaceData, AUSearchedPlaceData } from '../entity/address.entity';

export const addressesSearchApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      /**
       * Search places for SG
       */
      searchPlacesForSG: builder.query<SGSearchedPlaceData[], { query: string }>({
        query: ({ query }) => ({
          url: `/addresses`,
          params: {
            q: encodeURIComponent(query.trim()),
          },
        }),
      }),
      /**
       * Search zipcode for AU
       */
      searchZipcodeForAU: builder.query<AUSearchedPlaceData[], { query: string }>({
        query: ({ query }) => ({
          url: `/cities`,
          params: {
            q: query,
            size: 100,
          },
        }),
      }),

      /**
       * Search places by google api
       */
      searchPlacesByGoogleApi: builder.query<
        GoogleAddressEntity_V2[],
        {
          query: string;
          type?: 'zipcode';
          sessiontoken?: string;
          country?: string;
        }
      >({
        query: ({ query, type, sessiontoken }) => ({
          url: `/places/autocomplete`,
          params: {
            query: query,
            type,
            sessiontoken,
          },
        }),
      }),
    };
  },
});
export const { searchPlacesForSG, searchZipcodeForAU, searchPlacesByGoogleApi } = addressesSearchApi.endpoints;
export const {
  useSearchPlacesForSGQuery,
  useSearchZipcodeForAUQuery,
  useSearchPlacesByGoogleApiQuery,
  useLazySearchPlacesByGoogleApiQuery,
} = addressesSearchApi;
