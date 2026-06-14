import { api } from '@castlery/shared-redux-services';
import type { TradePartnerItemType } from '../entity/checkout.entity';

export const partnerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTradePartners: builder.query<TradePartnerItemType[], void>({
      query: () => ({
        url: `trade_partners`,
      }),
    }),
  }),
});

export const { useGetTradePartnersQuery } = partnerApi;
