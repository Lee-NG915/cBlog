export interface ParsedGoogleAddressEntity_V2 {
  address1: string;
  city: string;
  zipcode: string;
  state_name: string;
  street: string;
  street_number: string;
}
export interface GoogleAddressEntity_V2 {
  google_place_id: string;
  description: string;
}
export interface CamelCaseParsedGoogleAddressEntity_V2 {
  address1: string;
  city: string;
  zipcode: string;
  stateName: string;
  street: string;
  streetNumber: string;
}
export interface LocationSearchZipcodeResult {
  zipcode: string;
  countryState: string;
  city?: string;
}
