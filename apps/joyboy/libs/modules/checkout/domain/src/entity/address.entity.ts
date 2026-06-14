export interface SearchAddressResult {
  id: string;
  building_name: string;
  zipcode: string;
  street_number: string;
  street: string;
  latitude: string;
  longitude: string;
  building_type: string;
}

export interface ChangeAddressRequestPayload {
  ship_address_attributes: AddressEntity;
  bill_address_attributes: AddressEntity;
}

export interface AddAddressRequestPayload {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  channel: string;
  phone: string;
  terms_of_use: TermsOfUse;
  emailHashed: string;
  firstnameHashed: string;
  lastnameHashed: string;
  building_name: string;
  zipcode: string;
  street_number: string;
  street: string;
  latitude: string;
  longitude: string;
  building_type: string;
  company: string;
  level: string;
  flat: string;
  country: string;
  alternative_phone: string;
  is_manual: boolean;
}
export interface TermsOfUse {
  accepted_version: string;
  accepted_at: string;
}

export interface AddressEntity {
  id: number;
  firstname: string;
  lastname: string;
  address1: string;
  phone: string;
  zipcode: string;
  address2?: string | undefined;
  city: string;
  street?: string;
  building_name?: string;
  street_number?: string;
  level?: string;
  flat?: string;
  is_manual?: boolean;
  is_temporary: boolean;
  building_type?: string | null;
  is_valid: boolean;
  is_shippable: boolean;
  country: string;
  alternative_phone?: string;
  state?: string;
  state_name?: string; //'CA','MD
  company?: string;
  google_place_id?: string; //us=>'ChIJIx09IErPwoARjgZb8t9y6gc
}
