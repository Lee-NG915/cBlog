import { OrderBusinessFeatures } from '../entity/business-features.entity';

export const SGMarket: OrderBusinessFeatures = {
  showSummaryTotalAddonDescription: false,
  getOrderSummaryTotalAddonDescription: () => {
    return 'Incl. GST';
  },
  showSalesTax: false,
  zipcodeFormatUtil: (value: string) => value,
  defaultCity: {
    city: 'SINGAPORE',
    state: '01',
    zipcode: '',
  },
};
