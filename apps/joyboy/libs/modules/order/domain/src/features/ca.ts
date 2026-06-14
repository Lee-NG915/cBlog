import { OrderBusinessFeatures } from '../entity/business-features.entity';

export const CAMarket: OrderBusinessFeatures = {
  showSummaryTotalAddonDescription: true,
  getOrderSummaryTotalAddonDescription: () => {
    return 'Incl. taxes';
  },
  showSalesTax: true,
  zipcodeFormatUtil: (value: string) => {
    if (!value) return value;
    const upperCaseValue = value.toUpperCase();
    const str = upperCaseValue.replace(/\s/g, '');
    const match = str.match(/^(\w{3})(\w{3})$/);
    if (match) {
      const str = `${match[1]} ${match[2]}`;
      return str;
    }
    return upperCaseValue;
  },
  defaultCity: {
    city: 'Toronto',
    state: 'ON',
    zipcode: 'M5H 2N1',
  },
};
