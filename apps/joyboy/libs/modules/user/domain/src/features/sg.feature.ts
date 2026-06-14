import { UserBusinessFeatures } from '../entity/business-features.entity';

export class SGMarketFeatures implements UserBusinessFeatures {
  getUserAddressFeatures() {
    return {
      showApartmentBeforeStreet: false,
    };
  }
}
