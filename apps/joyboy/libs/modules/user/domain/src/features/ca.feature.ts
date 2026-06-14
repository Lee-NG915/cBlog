import { UserBusinessFeatures } from '../entity/business-features.entity';

export class CAMarketFeatures implements UserBusinessFeatures {
  getUserAddressFeatures() {
    return {
      showApartmentBeforeStreet: false,
    };
  }
}
