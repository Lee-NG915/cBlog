/**
 * [Address{
id*	integer($int32)
firstname*	string
lastname*	string
address1	string
address2	string
city	string
zipcode*	string
phone*	string
alternative_phone	string
company	string
state	string
state_name	string
country	string
street	string
building_name	string
street_number	string
level	string
flat	string
is_manual	boolean
is_temporary*	boolean
is_valid*	boolean
is_shippable*	boolean
building_type*	string
nullable: true
}]
 */

import { createEntityAdapter } from '@reduxjs/toolkit';

type Address = {
  id: number;
  firstname: string;
  lastname: string;
  address1: string;
  address2: string;
  city: string;
  zipcode: string;
  phone: string;
  alternative_phone: string;
  company: string;
  state: string;
  state_name: string;
  country: string;
  street: string;
  building_name: string;
  street_number: string;
  level: string;
  flat: string;
  is_manual: boolean;
  is_temporary: boolean;
  is_valid: boolean;
  is_shippable: boolean;
  building_type: string;
};

export interface SGSearchedPlaceData {
  id: string;
  building_name: string;
  zipcode: string;
  street_number: string;
  street: string;
  latitude: string;
  longitude: string;
  building_type: string;
}

export interface AUSearchedPlaceData {
  id: string;
  city: string;
  state: string;
  zipcode: string;
}

export const addressAdapter = createEntityAdapter<Address>();
export type { Address };
