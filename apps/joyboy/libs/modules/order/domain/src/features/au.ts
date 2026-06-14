import { OrderBusinessFeatures } from '../entity/business-features.entity';

export const AUMarket: OrderBusinessFeatures = {
  showSummaryTotalAddonDescription: false,
  getOrderSummaryTotalAddonDescription: () => {
    return 'Incl. GST';
  },
  showSalesTax: false,
  zipcodeFormatUtil: (value: string) => value,
  defaultCity: {
    city: 'SYDNEY',
    state: 'NSW',
    zipcode: '2000',
  },
};
