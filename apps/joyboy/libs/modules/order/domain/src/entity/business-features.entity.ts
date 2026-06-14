export interface OrderBusinessFeatures {
  showSummaryTotalAddonDescription: boolean;
  getOrderSummaryTotalAddonDescription: (inCartPage?: boolean) => string;
  showSalesTax: boolean;
  zipcodeFormatUtil: (value: string) => string;
  defaultCity: {
    city: string;
    state: string;
    zipcode: string;
  };
}
