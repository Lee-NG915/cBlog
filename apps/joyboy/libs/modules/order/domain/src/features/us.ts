import { OrderBusinessFeatures } from '../entity/business-features.entity';

export const USMarket: OrderBusinessFeatures = {
  showSummaryTotalAddonDescription: true,
  getOrderSummaryTotalAddonDescription: () => {
    // return inCartPage ? 'Excl. Tax' : '';
    return 'incl taxes & shipping';
  },
  showSalesTax: true,
  zipcodeFormatUtil: (value: string) => value,
  defaultCity: {
    city: 'Los Angeles',
    state: 'CA',
    zipcode: '90024',
  },
};
