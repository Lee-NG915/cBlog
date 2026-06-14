import { UserBusinessFeatures } from '../entity/business-features.entity';

export class UKMarketFeatures implements UserBusinessFeatures {
  getUserAddressFeatures() {
    return {
      showApartmentBeforeStreet: true,
    };
  }
}
