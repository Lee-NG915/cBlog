export interface UserAddressFeatures {
  showApartmentBeforeStreet: boolean;
}
export interface UserBusinessFeatures {
  getUserAddressFeatures(): UserAddressFeatures;
}
