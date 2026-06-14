import { OrderBusinessFeatures } from '../entity/business-features.entity';

export const UKMarket: OrderBusinessFeatures = {
  showSummaryTotalAddonDescription: true,
  getOrderSummaryTotalAddonDescription: () => {
    return 'Incl. VAT';
  },
  showSalesTax: false,
  zipcodeFormatUtil: (value: string) => {
    if (!value) return '';
    const postcode = value.replace(/\s+/g, '').toUpperCase();
    if (postcode.length < 5 || postcode.length > 7) return postcode;

    // 拆分成前缀和后缀（后三位始终为后缀）
    const outward = postcode.slice(0, postcode.length - 3);
    const inward = postcode.slice(-3);
    return `${outward} ${inward}`;
  },
  defaultCity: {
    city: 'London',
    state: 'Greater London',
    zipcode: 'WC1A 1AA',
  },
};
