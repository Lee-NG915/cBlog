import { UserBusinessFeatures } from '../entity/business-features.entity';

export class USMarketFeatures implements UserBusinessFeatures {
  getUserAddressFeatures() {
    return {
      showApartmentBeforeStreet: false,
    };
  }
}
