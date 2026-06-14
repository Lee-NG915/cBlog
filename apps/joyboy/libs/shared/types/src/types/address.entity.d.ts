export interface CustomerAddressEntity_V2 {
  id: number;
  firstname: string;
  lastname: string;
  phone: string;
  alternativePhone: string;
  address1: string;
  address2: string;
  street: string;
  streetNumber: string;
  level: string;
  flat: string;
  buildingType: string;
  buildingName: string;
  country: string;
  zipcode: string;
  stateName?: string; // SG 没有该字段
  city: string;
  company: string;
  unit?: string;
  google_place_id?: string;
  description?: string;
}
export interface CustomerAddressEntity {
  id: number;
  firstname: string;
  lastname: string;
  phone: string;
  alternative_phone: string;
  address1: string;
  address2: string;
  street: string;
  street_number: string;
  level: string;
  flat: string;
  building_type: string;
  building_name: string;
  country: string;
  zipcode: string;
  state_name?: string; // SG 没有该字段
  city: string;
  company: string;
  unit?: string;
  google_place_id?: string;
  description?: string;
}
export interface GoogleAddressEntity_V2 {
  description: string;
  google_place_id: string;
}

export type ParsedGoogleAddressEntity_V2 = {
  address1: string;
  city: string;
  zipcode: string;
  state_name: string;
  street: string; // "Mount Dandenong Tourist Road"
  street_number: string; //"1A"
  description: string;
  google_place_id: string;
};

export interface CamelCaseParsedGoogleAddressEntity_V2 {
  address1: string;
  city: string;
  zipcode: string;
  stateName: CustomerAddressEntity_V2['stateName'];
  street: CustomerAddressEntity_V2['street'];
  streetNumber: CustomerAddressEntity_V2['streetNumber'];
}

export interface CheckoutAddressEntity_V2 extends CustomerAddressEntity_V2 {
  autoSelected: boolean;
}
