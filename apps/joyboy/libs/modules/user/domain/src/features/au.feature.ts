import { UserBusinessFeatures } from '../entity/business-features.entity';

export class AUMarketFeatures implements UserBusinessFeatures {
  getUserAddressFeatures() {
    return {
      showApartmentBeforeStreet: false,
    };
  }
}
